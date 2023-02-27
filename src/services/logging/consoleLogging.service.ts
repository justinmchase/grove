import { snakeCase } from "../../../deps/case.ts";
import {
  bgBlue,
  bgRed,
  blue,
  brightBlack,
  brightWhite,
  red,
  yellow,
} from "../../../deps/std.ts";
import { toSerializable } from "../../util/serializable.ts";
import { LoggingService, LogLevel } from "./logging.service.ts";

export class ConsoleLoggingService extends LoggingService {
  public async log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    const n = snakeCase(name);
    const m = JSON.stringify((message ?? "").replace(/"/g, "'"));
    const d = JSON.stringify(toSerializable(data));
    const l = (() => {
      switch (level) {
        case LogLevel.Trace:
          return bgBlue(level);
        case LogLevel.Debug:
          return blue(level);
        case LogLevel.Info:
          return brightBlack(level);
        case LogLevel.Warn:
          return yellow(level);
        case LogLevel.Error:
          return red(level);
        case LogLevel.Critical:
          return bgRed(brightWhite(level));
      }
    })();
    await console.log(`${l} ${n} ${m} ${d}`);
  }
}
