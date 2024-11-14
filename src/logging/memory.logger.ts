import type { LogLevel } from "./logLevel.ts";
import { BaseLogger } from "./base.logger.ts";

export class MemoryLogger extends BaseLogger {
  public readonly logs: {
    level: LogLevel;
    message: string;
    data: Record<string, unknown>;
  }[] = [];
  public async log(
    level: LogLevel,
    message: string,
    data: Record<string, unknown>,
  ) {
    await this.logs.push({
      level,
      message,
      data,
    });
  }
}
