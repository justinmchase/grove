import {
  Database,
  MongoClient,
  parseConnectionString,
} from "../../../deps/mongo.ts";
import { ILogger } from "../../mod.ts";

export class MongoService {
  constructor(
    private readonly client: MongoClient,
    private readonly db: Database,
  ) {
  }

  public collection(name: string) {
    return this.db.collection(name);
  }

  public close() {
    this.client.close();
  }

  public static async create(
    logging: ILogger,
    mongoConnectionString: string,
  ) {
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
    );
    return new MongoService(client, db);
  }
}
