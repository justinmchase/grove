import {
  bgRed,
  blue,
  brightBlack,
  brightWhite,
  red,
  yellow,
} from "@std/fmt/colors";
import { toSerializable } from "@justinmchase/serializable";
import { LogLevel } from "./logLevel.ts";
import { BaseLogger } from "./base.logger.ts";

export class ConsoleLogger extends BaseLogger {
  private readonly isTTY: boolean;
  constructor(logLevel: LogLevel = LogLevel.Info) {
    super(logLevel);
    this.isTTY = Deno.stdout.isTerminal();
  }
  public async log(
    level: LogLevel,
    message: string,
    data: Record<keyof unknown, unknown>,
  ) {
    const m = JSON.stringify((message ?? "").replace(/"/g, "'"));
    const d = JSON.stringify(toSerializable(data));
    const l = (() => {
      if (this.isTTY) {
        switch (level) {
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
    await console.log(`${l} ${m} ${d}`);
  }
}
