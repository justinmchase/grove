export * from "./logging/mod.ts";
import { ILoggingService } from "./logging/mod.ts";

export interface IServices {
  logging: ILoggingService;
}
