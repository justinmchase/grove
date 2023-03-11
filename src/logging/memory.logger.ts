import { LogLevel } from "./logLevel.ts";
import { Logger } from "./logger.ts";

export class MemoryLogger extends Logger {
  public readonly logs: {
    level: LogLevel;
    name: string;
    message: string;
    data: Record<string, unknown>;
  }[] = [];
  public async log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    await this.logs.push({
      level,
      name,
      message,
      data,
    });
  }
}
