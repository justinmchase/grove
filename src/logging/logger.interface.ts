import type { LogLevel } from "./logLevel.ts";

/**
 * Logger is the interface that will be used to log messages.
 */
export type Logger = {
  /**
   * The log method is used to log messages at a specific log level.
   * @param level - The log level to use.
   * @param message - The message to log.
   * @param data - The data to log.
   */
  log(
    level: LogLevel,
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  /**
   * A helper method to log messages at the debug level.
   * @param message The message to log.
   * @param data Structured data to log.
   */
  debug(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  /**
   * A helper method to log messages at the warn level.
   * @param message The message to log.
   * @param data Structured data to log.
   */
  warn(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  /**
   * A helper method to log messages at the info level.
   * @param message The message to log.
   * @param data Structured data to log.
   */
  info(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  /**
   * A helper method to log messages at the error level.
   * @param message The message to log.
   * @param error The error to log.
   * @param data Structured data to log.
   */
  error(
    message: string,
    error: unknown,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  /**
   * A helper method to log messages at the critical level.
   * @param message The message to log.
   * @param data Structured data to log.
   */
  critical(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
};
