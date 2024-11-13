import { LogLevel } from "./logLevel.ts";
import type { ILogger } from "./logger.interface.ts";

export abstract class Logger implements ILogger {
  public abstract log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ): Promise<void>;

  public async trace(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    await this.log(LogLevel.Trace, name, message, data);
  }

  public async debug(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    await this.log(LogLevel.Debug, name, message, data);
  }

  public async warn(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    await this.log(LogLevel.Warn, name, message, data);
  }

  public async info(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    await this.log(LogLevel.Info, name, message, data);
  }

  public async error(
    name: string,
    message: string,
    error: Error,
    data: Record<string, unknown> = {},
  ) {
    await this.log(LogLevel.Error, name, message, {
      ...data,
      error,
    });
  }

  public async critical(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    await this.log(LogLevel.Critical, name, message, data);
  }
}
