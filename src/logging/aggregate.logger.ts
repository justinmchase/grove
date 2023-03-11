import { LogLevel } from "./logLevel.ts";
import { ILogger } from "./logger.interface.ts";
import { Logger } from "./logger.ts";

export class AggregateLogger extends Logger {
  private readonly loggers: ILogger[];
  constructor(...loggers: ILogger[]) {
    super();
    this.loggers = [...loggers];
  }
  public async log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    await Promise.all(
      this.loggers.map((logger) => logger.log(level, name, message, data)),
    );
  }
}
