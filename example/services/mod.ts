import {
  ConsoleLoggingService,
  ILoggingService,
  IServices,
} from "../../src/mod.ts";
import { DbService } from "./db/mod.ts";

export * from "./db/mod.ts";

export interface Services extends IServices {
  logging: ILoggingService;
  db: DbService;
}

export async function initServices(): Promise<Services> {
  const logging = new ConsoleLoggingService();
  const db = new DbService();
  return await {
    logging,
    db,
  };
}
