import * as mongo from "@db/mongo";

/**
 * @module
 * This module provides a MongoDB client compatible with the current version of Grove.
 * It is used to connect to a MongoDB database and perform operations on it.
 *
 * @example
 * ```ts
 * import { mongo } from "@justinmchase/grove/deps";
 *
 * const client = new mongo.MongoClient();
 * await client.connect("mongodb://localhost:27017");
 * ```
 */

export {
  /**
   * @db/mongo module compatible with this version of Grove.
   */
  mongo,
};
