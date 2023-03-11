import { LogLevel } from "./logLevel.ts";

export interface ILogger {
  log(
    level: LogLevel,
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  trace(
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  debug(
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  warn(
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  info(
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  error(
    name: string,
    message: string,
    error: Error,
    data?: Record<string, unknown>,
  ): Promise<void>;
  critical(
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
}
