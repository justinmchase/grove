import { HelloManager } from "./hello.manager.ts";
import type { Repositories } from "../repositories/mod.ts";

export * from "./hello.manager.ts";

export type Managers = {
  hellos: HelloManager;
};

export async function initManagers(repositories: Repositories) {
  const hellos = new HelloManager(repositories.hellos);
  return await {
    hellos,
  };
}
