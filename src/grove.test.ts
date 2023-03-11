import { assert, assertSpyCall, assertSpyCalls, stub } from "../deps/std.ts";
import { IContext } from "./context.ts";
import { Grove } from "./grove.ts";
import { MemoryLogger } from "./logging/mod.ts";
import { IMode } from "./modes/mode.interface.ts";

Deno.test({
  name: "exits with error code if no modes",
  fn: async () => {
    const exit = stub(Deno, "exit");
    const log = stub(console, "log");
    try {
      const grove = new Grove({
        initContext: async () => {
          return await { log: new MemoryLogger() };
        },
        modes: [],
      });
      await grove.start([]);
      assertSpyCall(exit, 0, {
        args: [1],
      });
    } finally {
      exit.restore();
      log.restore();
    }
  },
});

class TestMode implements IMode<IContext> {
  public readonly name = "test";
  public didRun = false;
  public async run(_context: IContext): Promise<void> {
    this.didRun = true;
    await undefined;
  }
}

Deno.test({
  name: "runs a mode mode",
  fn: async () => {
    const exit = stub(Deno, "exit");
    const log = stub(console, "log");
    try {
      const testMode = new TestMode();
      const grove = new Grove({
        initContext: async () => {
          return await { log: new MemoryLogger() };
        },
        modes: [
          testMode,
        ],
      });
      await grove.start(["test"]);
      assertSpyCalls(exit, 0);
      assert(testMode.didRun);
    } finally {
      exit.restore();
      log.restore();
    }
  },
});

Deno.test({
  name: "runs correct mode",
  fn: async () => {
    const exit = stub(Deno, "exit");
    const log = stub(console, "log");
    try {
      const testMode = new TestMode();
      const grove = new Grove({
        initContext: async () => {
          return await { log: new MemoryLogger() };
        },
        modes: [
          { name: "a" } as IMode<IContext>,
          testMode,
          { name: "z" } as IMode<IContext>,
        ],
      });
      await grove.start(["test"]);
      assertSpyCalls(exit, 0);
      assert(testMode.didRun);
    } finally {
      exit.restore();
      log.restore();
    }
  },
});
