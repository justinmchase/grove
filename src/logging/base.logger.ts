import { LogLevel } from "./logLevel.ts";
import type { Logger } from "./logger.interface.ts";

export abstract class BaseLogger implements Logger {
  constructor(protected readonly level: LogLevel = LogLevel.Info) {}
  public abstract log(
    level: LogLevel,
    message: string,
    data: Record<keyof unknown, unknown>,
  ): Promise<void>;

  public async debug(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    if ([LogLevel.Debug].includes(this.level)) {
      await this.log(LogLevel.Debug, message, data);
    }
  }

  public async warn(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    if ([LogLevel.Debug, LogLevel.Warn].includes(this.level)) {
      await this.log(LogLevel.Warn, message, data);
    }
  }

  public async info(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    if ([LogLevel.Debug, LogLevel.Warn, LogLevel.Info].includes(this.level)) {
      await this.log(LogLevel.Info, message, data);
    }
  }

  public async error(
    message: string,
    error: unknown,
    data: Record<keyof unknown, unknown> = {},
  ) {
    if (
      [LogLevel.Debug, LogLevel.Warn, LogLevel.Info, LogLevel.Error].includes(
        this.level,
      )
    ) {
      await this.log(LogLevel.Error, message, {
        ...data,
        error,
      });
    }
  }

  public async critical(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    await this.log(LogLevel.Critical, message, data);
  }
}
