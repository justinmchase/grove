import {
  assert,
  assertEquals,
  assertSpyCall,
  assertSpyCalls,
  stub,
} from "../deps/std.ts";
import { IContext } from "./context.ts";
import { Grove } from "./grove.ts";
import { MemoryLogger } from "./logging/mod.ts";
import { IMode, IModeOption } from "./modes/mode.interface.ts";
import { Type } from "./util/type.ts";

function failure(action: () => Promise<void>) {
  return async () => {
    const exit = stub(Deno, "exit");
    const log = stub(console, "log");
    try {
      await action();
      assertSpyCall(exit, 0, {
        args: [1],
      });
    } finally {
      exit.restore();
      log.restore();
    }
  };
}

function success(action: () => Promise<void>) {
  return async () => {
    const exit = stub(Deno, "exit");
    const log = stub(console, "log");
    try {
      await action();
      assertSpyCalls(exit, 0);
    } finally {
      exit.restore();
      log.restore();
    }
  };
}

class TestMode implements IMode<IContext> {
  public readonly description = "For testing only";
  getOptions(): IModeOption[] {
    return this.options;
  }
  getModes(): IMode<IContext>[] {
    return this.modes;
  }
  constructor(
    public readonly name: string,
    public readonly options: IModeOption[] = [],
    public readonly modes: IMode<IContext>[] = [],
  ) {
  }

  public didRun = false;
  public args?: Record<string, unknown> = undefined;
  public async run(args: unknown, _context: IContext): Promise<void> {
    this.didRun = true;
    this.args = args as Record<string, unknown>;
    await undefined;
  }
}

Deno.test({
  name: "exits with error code if no modes",
  fn: failure(async () => {
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [],
    });
    await grove.start([]);
  }),
});

Deno.test({
  name: "runs a mode",
  fn: success(async () => {
    const testMode = new TestMode("test");
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [
        testMode,
      ],
    });
    await grove.start(["test"]);
    assert(testMode.didRun);
  }),
});

Deno.test({
  name: "runs a mode with options",
  fn: success(async () => {
    const testMode = new TestMode("test", [{
      type: Type.String,
      name: "foo",
      description: "foo",
    }]);
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [
        testMode,
      ],
    });
    await grove.start(["test", "--foo", "xyz"]);
    assert(testMode.didRun);
    assertEquals("xyz", testMode.args?.foo);
  }),
});

Deno.test({
  name: "runs correct mode",
  fn: success(async () => {
    const testMode = new TestMode("test");
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [
        new TestMode("a"),
        testMode,
        new TestMode("b"),
      ],
    });
    await grove.start(["test"]);
    assert(testMode.didRun);
  }),
});

Deno.test({
  name: "runs sub mode",
  fn: success(async () => {
    const subMode = new TestMode("sub");
    const testMode = new TestMode("test", [], [subMode]);
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [
        new TestMode("a"),
        testMode,
        new TestMode("b"),
      ],
    });
    await grove.start(["test", "sub"]);
    assert(!testMode.didRun);
    assert(subMode.didRun);
  }),
});

Deno.test({
  name: "runs run parent mode even with subs",
  fn: success(async () => {
    const subMode = new TestMode("sub");
    const testMode = new TestMode("test", [], [subMode]);
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [
        new TestMode("a"),
        testMode,
        new TestMode("b"),
      ],
    });
    await grove.start(["test"]);
    assert(testMode.didRun);
    assert(!subMode.didRun);
  }),
});

Deno.test({
  name: "runs sub mode with options",
  fn: success(async () => {
    const subMode = new TestMode("sub", [{
      type: Type.String,
      name: "foo",
      description: "foo",
    }]);
    const testMode = new TestMode("test", [], [subMode]);
    const grove = new Grove({
      initContext: async () => {
        return await { log: new MemoryLogger() };
      },
      modes: [
        new TestMode("a"),
        testMode,
        new TestMode("b"),
      ],
    });
    await grove.start(["test", "sub", "--foo", "xyz"]);
    assert(!testMode.didRun);
    assert(subMode.didRun);
    assertEquals("xyz", subMode.args?.foo);
  }),
});
