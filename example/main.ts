import { Context, State } from "./context.ts";
import { initControllers } from "./controllers/mod.ts";
import { initServices } from "./services/mod.ts";
import { initRepositories } from "./repositories/mod.ts";
import { initManagers } from "./managers/mod.ts";
import { ConsoleLogger, Grove, WebMode } from "../src/mod.ts";

async function initContext(): Promise<Context> {
  const services = await initServices();
  const repositories = await initRepositories(services);
  const managers = await initManagers(repositories);
  return {
    log: new ConsoleLogger(),
    services,
    repositories,
    managers,
  };
}

const grove = new Grove({
  initContext,
  modes: [
    new WebMode<Context, State>({ initControllers }),
  ],
});

await grove.start(Deno.args);
