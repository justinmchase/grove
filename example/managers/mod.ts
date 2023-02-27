import { Repositories } from "../repositories/mod.ts";
import { HelloManager } from "./hello.manager.ts";

export * from "./hello.manager.ts";

export type Managers = {
  hellos: HelloManager;
}

export async function initManagers(repositories: Repositories) {
  const hellos = new HelloManager(repositories.hellos);
  return await {
    hellos
  };
}