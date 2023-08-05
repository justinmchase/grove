import { Context, JobContext, State } from "./context.ts";
import { initControllers } from "./controllers/mod.ts";
import { initServices } from "./services/mod.ts";
import { initRepositories } from "./repositories/mod.ts";
import { initManagers } from "./managers/mod.ts";
import { initJobs } from "./jobs/mod.ts";
import { ConsoleLogger, Grove, JobMode, WebMode } from "../src/mod.ts";

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
    new JobMode<JobContext>({ initJobs }),
  ],
});

await grove.start(Deno.args);

// deno run -A example/main.ts web
