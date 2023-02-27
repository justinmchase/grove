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
  private readonly isTTY: boolean;
  constructor() {
    super();
    this.isTTY = Deno.isatty(Deno.stdout.rid);
  }
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
      if (this.isTTY) {
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
      } else {
        return level;
      }
    })();
    await console.log(`${l} ${n} ${m} ${d}`);
  }
}
