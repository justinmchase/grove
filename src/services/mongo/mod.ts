import { MongoClient } from "@db/mongo/client";
import type { Collection, Database, Document } from "@db/mongo";
import type { ILogger } from "../../mod.ts";

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
    logging: ILogger,
    config: IMongoConfig,
  ): Promise<MongoService> {
    const { mongoConnectionString } = config;
    if (!mongoConnectionString) {
      logging.warn(
        "mongo",
        "MONGO_CONNECTION_STRING not found. Please create a .env file or set up your environment correctly.",
      );
    }

    const client = new MongoClient();
    // todo: this got removed in the latest version of this library, not sure if its needed anymore or not
    // const options = await parseConnectionString(mongoConnectionString);
    // if (mongoConnectionString.indexOf("localhost") === -1) {
    //   options.tls = true;
    // }
    const db = await client.connect(mongoConnectionString);
    logging.info(
      `mongo`,
      "mongo connected",
      {
        name: db.name,
      },
    );
    return new MongoService(client, db);
  }
}
