export enum LogLevel {
  Trace = "T",
  Debug = "D",
  Warn = "W",
  Info = "I",
  Error = "E",
  Critical = "C",
}

export interface ILoggingService {
  log(
    level: LogLevel,
    name: string,
    message: string,
    data?: Record<string, unknown>,
  ): void;
  trace(name: string, message: string, data?: Record<string, unknown>): void;
  debug(name: string, message: string, data?: Record<string, unknown>): void;
  warn(name: string, message: string, data?: Record<string, unknown>): void;
  info(name: string, message: string, data?: Record<string, unknown>): void;
  error(
    name: string,
    message: string,
    error: Error,
    data?: Record<string, unknown>,
  ): void;
}
