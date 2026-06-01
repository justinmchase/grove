import type { Logger } from "../logging/mod.ts";

/**
 * This module provides a generic, resumable migration runner for `Deno.Kv`
 * databases. It is database-shape agnostic: each {@link Migration}
 * implementation defines how to scan and rewrite its own keys.
 *
 * Deno KV is intentionally schemaless and has no built-in migration story.
 * The recommended pattern in the Deno docs (backfill → cutover → cleanup)
 * combined with idempotent execution and a per-migration completion marker
 * works well across both local SQLite-backed KV and the FoundationDB-backed
 * production store on Deno Deploy.
 *
 * @module
 */

const MARKER_PREFIX: Deno.KvKey = ["_migrations"];

/**
 * Outcome counters returned by a migration's `run` method.
 */
export interface MigrationResult {
  /**
   * Total records the migration looked at, including records that were
   * already at the target version.
   */
  scanned: number;
  /**
   * Records the migration actually rewrote. For dry-runs this is the
   * number of records that *would* have been rewritten.
   */
  upgraded: number;
}

/**
 * Context passed to a {@link Migration}'s `run` method.
 */
export interface MigrationContext {
  /** The KV database the migration runs against. */
  kv: Deno.Kv;
  /** Logger to record progress and warnings. */
  logger: Logger;
  /**
   * When true the migration MUST NOT write to KV. Implementations should
   * still scan and report what they would have done.
   */
  dryRun: boolean;
  /**
   * Cursor previously persisted by this migration, or undefined on the
   * first run / after completion. Implementations should pass this to
   * `kv.list({ cursor: ... })` so a resumed run skips already-processed
   * records after an isolate restart.
   */
  resumeCursor: string | undefined;
  /**
   * Persist a checkpoint cursor for this migration. Implementations should
   * call this periodically (every N records) so progress survives an
   * isolate eviction. Calling `saveCursor` during a dry-run is a no-op.
   */
  saveCursor(cursor: string): Promise<void>;
}

/**
 * A single migration unit. Migrations are identified by a stable `id` that
 * MUST NOT change after the migration ships, because the runner records
 * completion under a marker key keyed by that id.
 */
export interface Migration {
  /**
   * Stable identifier used as the marker key. Conventionally prefixed with
   * a zero-padded sequence number, e.g. `"001-contacts-v1"`.
   */
  readonly id: string;
  /** Short human-readable description shown in logs. */
  readonly description: string;
  /**
   * Execute the migration. Implementations should use atomic per-record
   * writes (`kv.atomic().check(entry).set(...)`) so concurrent live traffic
   * wins on conflict and the migration is safe to interleave with normal
   * request handling.
   */
  run(ctx: MigrationContext): Promise<MigrationResult>;
}

/**
 * Options accepted by {@link MigrationRunner.runPending}.
 */
export interface MigrationRunOptions {
  /** When true the runner does not write markers and migrations are passed `dryRun: true`. */
  dryRun?: boolean;
  /** When set, only migrations whose `id` is in this list are considered. */
  only?: string[];
}

/**
 * Per-migration report returned from {@link MigrationRunner.runPending}.
 */
export interface MigrationRunReport {
  migration: string;
  status: "skipped" | "completed" | "dry-run";
  scanned: number;
  upgraded: number;
}

interface MarkerValue {
  completed_at: Date;
  scanned: number;
  upgraded: number;
}

/**
 * Runs an ordered list of {@link Migration}s against a `Deno.Kv` database.
 *
 * The runner is idempotent: each migration's completion is recorded under
 * `["_migrations", migration.id]`, so subsequent runs skip migrations that
 * have already completed. A per-migration resume cursor is stored at
 * `["_migrations", migration.id, "cursor"]` and deleted on successful
 * completion.
 *
 * Typical usage on Deno Deploy is to invoke `runPending()` once during
 * service startup (fire-and-forget) and/or from a `Deno.cron` job so the
 * platform will keep retrying long-running backfills.
 *
 * @example
 * ```ts
 * import { ConsoleLogger, MigrationRunner } from "@justinmchase/grove";
 *
 * const kv = await Deno.openKv();
 * const runner = new MigrationRunner(kv, new ConsoleLogger(), [myMigration]);
 * await runner.runPending();
 * ```
 */
export class MigrationRunner {
  /**
   * @param kv The KV database to run migrations against.
   * @param logger Logger used for per-migration progress messages.
   * @param migrations Ordered list of migrations. Append-only: never delete
   *                   or reorder once shipped.
   */
  constructor(
    private readonly kv: Deno.Kv,
    private readonly logger: Logger,
    private readonly migrations: readonly Migration[],
  ) {}

  /**
   * Execute every migration in the registry whose marker is absent.
   * Returns one {@link MigrationRunReport} per migration considered.
   */
  async runPending(
    opts: MigrationRunOptions = {},
  ): Promise<MigrationRunReport[]> {
    const reports: MigrationRunReport[] = [];
    for (const migration of this.migrations) {
      if (opts.only && !opts.only.includes(migration.id)) continue;

      const markerKey: Deno.KvKey = [...MARKER_PREFIX, migration.id];
      const existing = await this.kv.get<MarkerValue>(markerKey);
      if (existing.value && !opts.dryRun) {
        reports.push({
          migration: migration.id,
          status: "skipped",
          scanned: 0,
          upgraded: 0,
        });
        continue;
      }

      await this.logger.info(
        `migration ${migration.id}: starting (${migration.description})`,
      );

      const cursorKey: Deno.KvKey = [...MARKER_PREFIX, migration.id, "cursor"];
      const cursorEntry = await this.kv.get<string>(cursorKey);
      const ctx: MigrationContext = {
        kv: this.kv,
        logger: this.logger,
        dryRun: opts.dryRun ?? false,
        resumeCursor: cursorEntry.value ?? undefined,
        saveCursor: async (cursor: string) => {
          if (opts.dryRun) return;
          await this.kv.set(cursorKey, cursor);
        },
      };

      let result: MigrationResult;
      try {
        result = await migration.run(ctx);
      } catch (err) {
        await this.logger.error(`migration ${migration.id}: failed`, err);
        throw err;
      }

      if (!opts.dryRun) {
        const marker: MarkerValue = {
          completed_at: new Date(),
          scanned: result.scanned,
          upgraded: result.upgraded,
        };
        await this.kv.atomic()
          .set(markerKey, marker)
          .delete(cursorKey)
          .commit();
      }

      reports.push({
        migration: migration.id,
        status: opts.dryRun ? "dry-run" : "completed",
        scanned: result.scanned,
        upgraded: result.upgraded,
      });

      await this.logger.info(
        `migration ${migration.id}: ${
          opts.dryRun ? "dry-run" : "completed"
        } scanned=${result.scanned} upgraded=${result.upgraded}`,
      );
    }
    return reports;
  }
}
