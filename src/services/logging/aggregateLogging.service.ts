import {
  ILoggingService,
  LoggingService,
  LogLevel,
} from "./logging.service.ts";

export class AggregateLoggingService extends LoggingService {
  private readonly loggers: ILoggingService[];
  constructor(...loggers: ILoggingService[]) {
    super();
    this.loggers = [...loggers];
  }
  public async log(
    level: LogLevel,
    name: string,
    message: string,
    data: Record<string, unknown>,
  ) {
    await Promise.all(
      this.loggers.map((logger) => logger.log(level, name, message, data)),
    );
  }
}
