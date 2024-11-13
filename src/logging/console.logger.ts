import { snakeCase } from "@wok/case";
import {
  bgBlue,
  bgRed,
  blue,
  brightBlack,
  brightWhite,
  red,
  yellow,
} from "@std/fmt/colors";
import { toSerializable } from "@justinmchase/serializable";
import { LogLevel } from "./logLevel.ts";
import { Logger } from "./logger.ts";

export class ConsoleLogger extends Logger {
  private readonly isTTY: boolean;
  constructor() {
    super();
    this.isTTY = Deno.stdout.isTerminal();
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
