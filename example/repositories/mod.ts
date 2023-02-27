import { Services } from "../services/mod.ts";
import { HelloRepository } from "./hello/mod.ts";

export * from "./hello/mod.ts";

export type Repositories = {
  hellos: HelloRepository;
};

export async function initRepositories(services: Services) {
  const { db } = services;
  const hellos = new HelloRepository(db);
  return await {
    hellos,
  };
}
