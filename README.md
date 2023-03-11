# Grove

[![check](https://github.com/justinmchase/grove/actions/workflows/check.yml/badge.svg)](https://github.com/justinmchase/grove/actions/workflows/check.yml)

Grove is a
[Hybrid Microservice](https://justinmchase.com/2023/03/11/hybrid-microservice-architecture/)
framework for [Deno](https://deno.land).

## Usage

#### main.ts

```ts
import { Context, JobContext, State } from "./context.ts";
import { initControllers } from "./controllers/mod.ts";
import { initServices } from "./services/mod.ts";
import { initRepositories } from "./repositories/mod.ts";
import { initManagers } from "./managers/mod.ts";
import { initJobs } from "./jobs/mod.ts";
import {
  ConsoleLogger,
  Grove,
  JobMode,
  WebMode,
} from "https://deno.land/x/grove/mod.ts";

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
```

#### run in web mode

```sh
deno run -A main.ts web
```

#### run the hello job

```sh
deno run -A main.ts job hello --name Justin
```

### Example

See the [example](./example/main.ts) application for more information.
