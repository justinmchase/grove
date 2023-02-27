import { Context } from "./context.ts";
import { initServices } from "./services/mod.ts";
import { initRepositories } from "./repositories/mod.ts";
import { initControllers } from "./controllers/mod.ts";
import { Grove } from "../src/grove.ts";
import { initManagers } from "./managers/mod.ts";

async function initContext(): Promise<Context> {
  const services = await initServices();
  const repositories = await initRepositories(services);
  const managers = await initManagers(repositories);
  return {
    services,
    repositories,
    managers,
  };
}

const grove = new Grove({
  initContext,
  initControllers,
});

await grove.start();
