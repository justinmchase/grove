import { toSerializable } from "../../util/serializable.ts";
import { snakeCase } from "../../../deps/case.ts";
import { ILoggingService, LogLevel } from "./logging.service.ts";

export class ConsoleLoggingService implements ILoggingService {
  public log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    const n = snakeCase(name);
    const m = JSON.stringify(message.replace(/"/g, "'"));
    const d = JSON.stringify(toSerializable(data));
    console.log(`${level} ${n} ${m} ${d}`);
  }

  public trace(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    this.log(LogLevel.Trace, name, message, data);
  }

  public debug(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    this.log(LogLevel.Debug, name, message, data);
  }

  public warn(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    this.log(LogLevel.Warn, name, message, data);
  }

  public info(
    name: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    this.log(LogLevel.Info, name, message, data);
  }
  public error(
    name: string,
    message: string,
    error: Error,
    data: Record<string, unknown> = {},
  ) {
    this.log(LogLevel.Error, name, message, {
      ...data,
      error,
    });
  }
}
