import { assertSpyCall, assertSpyCalls, stub } from "../../deps/std.ts";
import { ISerializable } from "../util/serializable.ts";
import { ConsoleLogger } from "./console.logger.ts";
import { LogLevel } from "./logLevel.ts";

function logAsserter(logger: ConsoleLogger) {
  return (
    level: LogLevel,
    name: string,
    message: string,
    data: ISerializable,
    result: string,
  ) => {
    const consoleLog = stub(console, "log");
    try {
      logger.log(level, name, message, data);
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
    name: string,
    message: string,
    error: Error,
    data: ISerializable,
    result: string,
  ) => {
    const consoleLog = stub(console, "log");
    error.stack = "<stack>";
    try {
      logger.error(name, message, error, data);
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
      name: "log_level_00",
      fn: () =>
        assertLog(
          LogLevel.Trace,
          "example_test",
          "log test",
          {},
          'T example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_01",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "example_test",
          "log test",
          {},
          'D example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_02",
      fn: () =>
        assertLog(
          LogLevel.Warn,
          "example_test",
          "log test",
          {},
          'W example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_03",
      fn: () =>
        assertLog(
          LogLevel.Info,
          "example_test",
          "log test",
          {},
          'I example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_04",
      fn: () =>
        assertLog(
          LogLevel.Error,
          "example_test",
          "log test",
          {},
          'E example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_level_05",
      fn: () =>
        assertLog(
          LogLevel.Critical,
          "example_test",
          "log test",
          {},
          'C example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_name_00",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "example test",
          "log test",
          {},
          'D example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_name_01",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "ExampleTest",
          "log test",
          {},
          'D example_test "log test" {}',
        ),
    });
    await t.step({
      name: "log_name_02",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "a-b-c",
          "log test",
          {},
          'D a_b_c "log test" {}',
        ),
    });
    await t.step({
      name: "log_message_00",
      fn: () =>
        assertLog(LogLevel.Debug, "test", "a b c", {}, 'D test "a b c" {}'),
    });
    await t.step({
      name: "log_message_00",
      fn: () =>
        assertLog(LogLevel.Debug, "test", 'a"b"c', {}, "D test \"a'b'c\" {}"),
    });
    await t.step({
      name: "log_data_00",
      fn: () =>
        assertLog(
          LogLevel.Debug,
          "test",
          "test",
          { a: 1 },
          'D test "test" {"a":1}',
        ),
    });
    await t.step({
      name: "log_error_00",
      fn: () =>
        assertError(
          "test",
          "test",
          new Error("test"),
          {},
          'E test "test" {"error":{"name":"Error","message":"test","stack":"<stack>"}}',
        ),
    });
  },
});
