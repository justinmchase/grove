import {
  Database,
  Document,
  MongoClient,
  parseConnectionString,
} from "../../../deps/mongo.ts";
import { ILogger } from "../../mod.ts";

export interface IMongoConfig {
  mongoConnectionString: string;
}

export class MongoService {
  constructor(
    private readonly client: MongoClient,
    private readonly db: Database,
  ) {
  }

  public collection<T extends Document = Document>(name: string) {
    return this.db.collection<T>(name);
  }

  public close() {
    this.client.close();
  }

  public static async create(
    logging: ILogger,
    config: IMongoConfig,
  ) {
    const { mongoConnectionString } = config;
    if (!mongoConnectionString) {
      logging.warn(
        "mongo",
        "MONGO_CONNECTION_STRING not found. Please create a .env file or set up your environment correctly.",
      );
    }

    const client = new MongoClient();
    const options = await parseConnectionString(mongoConnectionString);
    if (mongoConnectionString.indexOf("localhost") === -1) {
      options.tls = true;
    }
    const db = await client.connect(options);
    logging.info(
      `mongo`,
      "mongo connected",
      {
        db: options.db,
        servers: options.servers,
        appname: options.appname,
      },
    );
    return new MongoService(client, db);
  }
}
