import { BaseLogger } from "./base.logger.ts";
import type { LogLevel } from "./logLevel.ts";
import type { Logger } from "./logger.interface.ts";

/**
 * AggregateLogger is a logger that aggregates multiple loggers.
 * It is used to log messages to multiple loggers at once.
 * @example
 * const logger = new AggregateLogger([new ConsoleLogger(), new FileLogger()]);
 * logger.log(LogLevel.INFO, "Hello World", { foo: "bar" });
 */
export class AggregateLogger extends BaseLogger {
  private readonly loggers: Logger[];
  constructor(loggers: Logger[]) {
    super();
    this.loggers = loggers;
  }

  /**
   * Logs a message to all loggers.
   * @param level The log level.
   * @param message The log message.
   * @param data The log data.
   */
  public async log(
    level: LogLevel,
    message: string,
    data: Record<keyof unknown, unknown>,
  ) {
    await Promise.all(
      this.loggers.map((logger) => logger.log(level, message, data)),
    );
  }
}
