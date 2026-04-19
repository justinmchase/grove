import { Collection } from "./collection.ts";

export class DbService {
  public collection<T extends { _id: number }>(name: string) {
    return new Collection<T>(name);
  }
}
