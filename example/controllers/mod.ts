import {
  Application,
  ErrorController,
  HealthController,
  IsHtmlController,
  LogController,
} from "../../src/mod.ts";
import { HelloController } from "./hello/mod.ts";
import { Context, State } from "../context.ts";

export async function initControllers(
  context: Context,
  app: Application<State>,
) {
  const {
    services: {
      logging,
    },
    managers: {
      hellos,
    },
  } = context;

  const error = new ErrorController(logging);
  const health = new HealthController();
  const isHtml = new IsHtmlController();
  const log = new LogController(logging);
  const hello = new HelloController(logging, hellos);

  await error.use(app);
  await health.use(app);
  await isHtml.use(app);
  await log.use(app);
  await hello.use(app);
}
