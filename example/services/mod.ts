import { DbService } from "./db/mod.ts";

export * from "./db/mod.ts";

export interface Services {
  db: DbService;
}

export async function initServices(): Promise<Services> {
  const db = new DbService();
  return await {
    db,
  };
}
