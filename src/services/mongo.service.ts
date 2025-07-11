import { MongoClient } from "mongodb";
import type { Collection, Db, Document } from "mongodb";
import type { Logger } from "../../mod.ts";

/**
 * This module provides the MongoService class, which is used to interact with a MongoDB database.
 * @module
 */

export interface IMongoConfig {
  mongoConnectionString: string;
}

/**
 * MongoService is a service that provides access to a MongoDB database.
 */
export class MongoService {
  constructor(
    private readonly client: MongoClient,
    private readonly db: Db,
  ) {
  }

  /**
   * Gets a collection from the database.
   * @param name The name of the collection to access.
   * @returns A collection object that can be used to perform operations on the collection.
   */
  public collection<T extends Document = Document>(
    name: string,
  ): Collection<T> {
    return this.db.collection<T>(name);
  }

  /**
   * Closes the connection to the database.
   */
  public close() {
    this.client.close();
  }

  /**
   * Creates a new instance of the MongoService asynchronously.
   * @param logger The logger to use for logging.
   * @param config The configuration object containing the MongoDB connection string.
   * @returns A new instance of the MongoService.
   */
  public static async create(
    logger: Logger,
    config: IMongoConfig,
  ): Promise<MongoService> {
    const { mongoConnectionString } = config;
    const client = new MongoClient(mongoConnectionString);
    await client.connect();

    const db = client.db();
    logger.info(
      `connected to database ${db.namespace}`,
      { name: db.namespace },
    );
    return new MongoService(client, db);
  }
}
