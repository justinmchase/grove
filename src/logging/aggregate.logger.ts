import { BaseLogger } from "./base.logger.ts";
import type { LogLevel } from "./logLevel.ts";
import type { Logger } from "./logger.interface.ts";

export class AggregateLogger extends BaseLogger {
  private readonly loggers: Logger[];
  constructor(...loggers: Logger[]) {
    super();
    this.loggers = [...loggers];
  }
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
