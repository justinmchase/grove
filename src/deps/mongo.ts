import * as mongo from "mongodb";

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
   * mongodb module compatible with this version of Grove.
   */
  mongo,
};
