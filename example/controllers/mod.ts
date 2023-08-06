import {
  Application,
  ErrorController,
  HealthController,
  IsHtmlController,
  LogController,
  NotFoundController,
} from "../../src/mod.ts";
import { HelloController } from "./hello/mod.ts";
import { Context, State } from "../context.ts";

export async function initControllers(
  context: Context,
  app: Application<State>,
) {
  const {
    managers: {
      hellos,
    },
  } = context;

  const error = new ErrorController();
  const health = new HealthController();
  const isHtml = new IsHtmlController();
  const log = new LogController();
  const hello = new HelloController(hellos);
  const notFound = new NotFoundController();

  await error.use(app);
  await health.use(app);
  await isHtml.use(app);
  await log.use(app);
  await hello.use(app);
  await notFound.use(app);
}
