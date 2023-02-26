import { toSerializable } from "../../util/serializable.ts";
import { snakeCase } from "../../../deps/case.ts";
import { LoggingService, LogLevel } from "./logging.service.ts";

export class ConsoleLoggingService extends LoggingService {
  public async log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    const n = snakeCase(name);
    const m = JSON.stringify(message.replace(/"/g, "'"));
    const d = JSON.stringify(toSerializable(data));
    await console.log(`${level} ${n} ${m} ${d}`);
  }
}
