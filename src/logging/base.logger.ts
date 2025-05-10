import { LogLevel } from "./logLevel.ts";
import type { Logger } from "./logger.interface.ts";

/**
 * This module provides the base logger for the application.
 * @module
 */

/**
 * BaseLogger is an abstract class that implements the Logger interface.
 * It provides default implementations for the log, debug, info, warn, error, and critical methods.
 * Subclasses must implement the log method to provide their own logging functionality.
 */
export abstract class BaseLogger implements Logger {
  public abstract log(
    level: LogLevel,
    message: string,
    data: Record<keyof unknown, unknown>,
  ): Promise<void>;

  public async debug(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    await this.log(LogLevel.Debug, message, data);
  }

  public async info(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    await this.log(LogLevel.Info, message, data);
  }

  public async warn(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    await this.log(LogLevel.Warn, message, data);
  }

  public async error(
    message: string,
    error: unknown,
    data: Record<keyof unknown, unknown> = {},
  ) {
    await this.log(LogLevel.Error, message, {
      ...data,
      error,
    });
  }

  public async critical(
    message: string,
    data: Record<keyof unknown, unknown> = {},
  ) {
    await this.log(LogLevel.Critical, message, data);
  }
}
