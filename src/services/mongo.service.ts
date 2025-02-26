import { MongoClient } from "@db/mongo/client";
import type { Collection, Database, Document } from "@db/mongo";
import type { Logger } from "../../mod.ts";

export interface IMongoConfig {
  mongoConnectionString: string;
}

export class MongoService {
  constructor(
    private readonly client: MongoClient,
    private readonly db: Database,
  ) {
  }

  public collection<T extends Document = Document>(
    name: string,
  ): Collection<T> {
    return this.db.collection<T>(name);
  }

  public close() {
    this.client.close();
  }

  public static async create(
    logger: Logger,
    config: IMongoConfig,
  ): Promise<MongoService> {
    const { mongoConnectionString } = config;
    const client = new MongoClient();
    const db = await client.connect(mongoConnectionString);
    logger.info(
      `connected to database ${db.name}`,
      { name: db.name },
    );
    return new MongoService(client, db);
  }
}
