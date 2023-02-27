import { Collection } from "./collection.ts";

export class DbService {
 public collection<T>(name: string) {
  return new Collection<T>(name);
 } 
}