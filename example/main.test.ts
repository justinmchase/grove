import { assert } from "@std/assert";
import { assertSpyCalls, stub } from "@std/testing/mock";
import { Grove } from "../src/grove.ts";
import { MemoryLogger } from "../src/logging/memory.logger.ts";
import { WebMode } from "../src/modes/web/web.mode.ts";
import type { Context, State } from "./context.ts";
import type { Services } from "./services/mod.ts";
import type { Repositories } from "./repositories/mod.ts";
import type { Managers } from "./managers/mod.ts";
import type { HelloManager } from "./managers/hello.manager.ts";
import { initControllers } from "./controllers/mod.ts";

function createTestContext(logger: MemoryLogger): Context {
  const hellos = {
    create: (
      arg: { name: string; punctuation: string },
    ) => ({
      _id: 1,
      name: arg.name,
      punctuation: arg.punctuation,
      greeting: `Hello ${arg.name}${arg.punctuation}`,
      createdAt: new Date(),
    }),
  } as unknown as HelloManager;

  return {
    logger,
    services: {} as Services,
    repositories: {} as Repositories,
    managers: { hellos } as Managers,
  };
}

Deno.test({
  name: "example app web mode starts and stops with AbortSignal",
  fn: async () => {
    const logger = new MemoryLogger();
    const context = createTestContext(logger);
    const port = 35505;
    const controller = new AbortController();

    const serveStub = stub(
      Deno,
      "serve",
      ((options) => {
        const signal = typeof options === "function"
          ? undefined
          : options?.signal;
        const finished = new Promise<void>((resolve) => {
          signal?.addEventListener("abort", () => resolve(), { once: true });
        });
        return { finished } as Deno.HttpServer<Deno.NetAddr>;
      }) as typeof Deno.serve,
    );

    const grove = new Grove({
      initContext: async () => await context,
      modes: [
        new WebMode<Context, State>({
          initControllers,
          hostname: "127.0.0.1",
          port,
        }),
      ],
      signal: controller.signal,
      ready: () => controller.abort(),
    });

    await grove.start(["web"]);
    assertSpyCalls(serveStub, 1);

    try {
      controller.abort();
    } finally {
      serveStub.restore();
    }

    assert(
      logger.logs.some((log) => log.message.includes("Listening on")),
      "expected server startup log message",
    );
  },
});
