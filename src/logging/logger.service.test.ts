import { assertSpyCall, assertSpyCalls, stub } from "@std/testing/mock";
import type { SerializableRecord } from "@justinmchase/serializable";
import { ConsoleLogger } from "./console.logger.ts";
import { LogLevel } from "./logLevel.ts";

function logAsserter(logger: ConsoleLogger) {
  return (
    level: LogLevel,
    message: string,
    data: SerializableRecord,
    result: string,
  ) => {
    const consoleLog = stub(console, "log");
    try {
      logger.log(level, message, data);
      assertSpyCalls(consoleLog, 1);
      assertSpyCall(consoleLog, 0, {
        args: [result],
        returned: undefined,
      });
    } finally {
      consoleLog.restore();
    }
  };
}
function logErrorAsserter(logger: ConsoleLogger) {
  return (
    message: string,
    error: Error,
    data: SerializableRecord,
    result: string,
  ) => {
    const consoleLog = stub(console, "log");
    error.stack = "<stack>";
    try {
      logger.error(message, error, data);
      assertSpyCalls(consoleLog, 1);
      assertSpyCall(consoleLog, 0, {
        args: [result],
        returned: undefined,
      });
    } finally {
      consoleLog.restore();
    }
  };
}

Deno.test({
  name: "logger_service",
  fn: async (t) => {
    const logger = new ConsoleLogger();
    const assertLog = logAsserter(logger);
    const assertError = logErrorAsserter(logger);
    await t.step({
      name: "log_level_01",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "log test",
          {},
          'D "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_02",
      fn: () =>
        assertLog(
          LogLevel.Warn,
          "log test",
          {},
          'W "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_03",
      fn: () =>
        assertLog(
          LogLevel.Info,
          "log test",
          {},
          'I "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_04",
      fn: () =>
        assertLog(
          LogLevel.Error,
          "log test",
          {},
          'E "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_05",
      fn: () =>
        assertLog(
          LogLevel.Critical,
          "log test",
          {},
          'C "log test" {}',
        ),
    });
    await t.step({
      name: "log_message_00",
      fn: () => assertLog(LogLevel.Debug, "a b c", {}, 'D "a b c" {}'),
    });
    await t.step({
      name: "log_message_00",
      fn: () => assertLog(LogLevel.Debug, 'a"b"c', {}, "D \"a'b'c\" {}"),
    });
    await t.step({
      name: "log_data_00",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "test",
          { a: 1 },
          'D "test" {"a":1}',
        ),
    });
    await t.step({
      name: "log_error_00",
      fn: () =>
        assertError(
          "test",
          new Error("test"),
          {},
          'E "test" {"error":{"name":"Error","message":"test","stack":"<stack>"}}',
        ),
    });
    
  },
});
