import type { LogLevel } from "./logLevel.ts";

export type Logger = {
  log(
    level: LogLevel,
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  debug(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  warn(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  info(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  error(
    message: string,
    error: unknown,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
  critical(
    message: string,
    data?: Record<keyof unknown, unknown>,
  ): Promise<void>;
};
