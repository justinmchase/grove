import { IContext, IState } from "../src/mod.ts";
import { Services } from "./services/mod.ts";
import { Repositories } from "./repositories/mod.ts";
import { Managers } from "./managers/mod.ts";

export type { Services } from "./services/mod.ts";

export interface Context extends IContext {
  services: Services;
  repositories: Repositories;
  managers: Managers;
}

export interface JobContext extends IContext {
  name: string;
  services: Services;
  repositories: Repositories;
  managers: Managers;
}

export interface State extends IState<Context> {
  dummy?: string;
}
