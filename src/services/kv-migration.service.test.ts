import { assertEquals } from "@std/assert";
import { ConsoleLogger } from "../logging/mod.ts";
import {
  type Migration,
  type MigrationContext,
  MigrationRunner,
} from "./kv-migration.service.ts";

const SILENT_LOGGER = new ConsoleLogger();

interface LegacyRecord {
  id: string;
  legacy_field: string;
}

interface UpgradedRecord {
  id: string;
  field: string;
  schema_version: 1;
}

function isUpgraded(value: unknown): value is UpgradedRecord {
  return typeof value === "object" && value !== null &&
    (value as { schema_version?: unknown }).schema_version === 1;
}

const sampleMigration: Migration = {
  id: "001-sample",
  description: "rename legacy_field to field and stamp schema_version",
  async run(ctx: MigrationContext) {
    let scanned = 0;
    let upgraded = 0;
    const opts: Deno.KvListOptions = { batchSize: 10 };
    if (ctx.resumeCursor) opts.cursor = ctx.resumeCursor;
    const iter = ctx.kv.list<unknown>({ prefix: ["records"] }, opts);
    for await (const entry of iter) {
      scanned++;
      if (isUpgraded(entry.value)) continue;
      const legacy = entry.value as LegacyRecord;
      const next: UpgradedRecord = {
        id: legacy.id,
        field: legacy.legacy_field,
        schema_version: 1,
      };
      if (ctx.dryRun) {
        upgraded++;
        continue;
      }
      const commit = await ctx.kv.atomic()
        .check(entry)
        .set(entry.key, next)
        .commit();
      if (commit.ok) upgraded++;
    }
    return { scanned, upgraded };
  },
};

Deno.test("MigrationRunner: runs pending migration and records marker", async () => {
  const kv = await Deno.openKv(":memory:");
  try {
    await kv.set(["records", "a"], { id: "a", legacy_field: "alpha" });
    await kv.set(["records", "b"], { id: "b", legacy_field: "beta" });

    const runner = new MigrationRunner(kv, SILENT_LOGGER, [sampleMigration]);
    const first = await runner.runPending();

    assertEquals(first.length, 1);
    assertEquals(first[0].status, "completed");
    assertEquals(first[0].scanned, 2);
    assertEquals(first[0].upgraded, 2);

    const a = await kv.get<UpgradedRecord>(["records", "a"]);
    assertEquals(a.value?.schema_version, 1);
    assertEquals(a.value?.field, "alpha");

    const marker = await kv.get(["_migrations", "001-sample"]);
    assertEquals(marker.value !== null, true);
  } finally {
    kv.close();
  }
});

Deno.test("MigrationRunner: rerun is a no-op when marker present", async () => {
  const kv = await Deno.openKv(":memory:");
  try {
    await kv.set(["records", "a"], { id: "a", legacy_field: "alpha" });

    const runner = new MigrationRunner(kv, SILENT_LOGGER, [sampleMigration]);
    await runner.runPending();
    const second = await runner.runPending();
    assertEquals(second[0].status, "skipped");
    assertEquals(second[0].scanned, 0);
  } finally {
    kv.close();
  }
});

Deno.test("MigrationRunner: dry-run does not write data or marker", async () => {
  const kv = await Deno.openKv(":memory:");
  try {
    await kv.set(["records", "a"], { id: "a", legacy_field: "alpha" });

    const runner = new MigrationRunner(kv, SILENT_LOGGER, [sampleMigration]);
    const report = await runner.runPending({ dryRun: true });

    assertEquals(report[0].status, "dry-run");
    assertEquals(report[0].upgraded, 1);

    const a = await kv.get<LegacyRecord>(["records", "a"]);
    assertEquals((a.value as LegacyRecord).legacy_field, "alpha");

    const marker = await kv.get(["_migrations", "001-sample"]);
    assertEquals(marker.value, null);
  } finally {
    kv.close();
  }
});

Deno.test("MigrationRunner: only filter restricts which migrations run", async () => {
  const kv = await Deno.openKv(":memory:");
  try {
    const other: Migration = {
      id: "002-other",
      description: "no-op",
      run: () => Promise.resolve({ scanned: 0, upgraded: 0 }),
    };
    const runner = new MigrationRunner(kv, SILENT_LOGGER, [
      sampleMigration,
      other,
    ]);
    const reports = await runner.runPending({ only: ["002-other"] });
    assertEquals(reports.length, 1);
    assertEquals(reports[0].migration, "002-other");

    const skipped = await kv.get(["_migrations", "001-sample"]);
    assertEquals(skipped.value, null);
  } finally {
    kv.close();
  }
});

Deno.test("MigrationRunner: resumeCursor and saveCursor round-trip via KV", async () => {
  const kv = await Deno.openKv(":memory:");
  try {
    let observedResume: string | undefined;
    const cursorMigration: Migration = {
      id: "003-cursor",
      description: "observe resume cursor",
      async run(ctx) {
        observedResume = ctx.resumeCursor;
        await ctx.saveCursor("checkpoint-1");
        return { scanned: 0, upgraded: 0 };
      },
    };

    // seed an existing cursor as if a prior run had checkpointed
    await kv.set(["_migrations", "003-cursor", "cursor"], "checkpoint-0");

    const runner = new MigrationRunner(kv, SILENT_LOGGER, [cursorMigration]);
    await runner.runPending();

    assertEquals(observedResume, "checkpoint-0");
    // marker written, cursor deleted on completion
    const marker = await kv.get(["_migrations", "003-cursor"]);
    assertEquals(marker.value !== null, true);
    const cursor = await kv.get(["_migrations", "003-cursor", "cursor"]);
    assertEquals(cursor.value, null);
  } finally {
    kv.close();
  }
});
