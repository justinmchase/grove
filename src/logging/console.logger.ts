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

/**
 * This module provides the ConsoleLogger class, which is used to log messages to the console.
 * @module
 */

/**
 * ConsoleLogger is a logger that logs messages to the console.
 * It formats the log messages based on the log level and whether the output is a TTY.
 */
export class ConsoleLogger extends BaseLogger {
  private readonly isTTY: boolean;
  constructor() {
    super();
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
