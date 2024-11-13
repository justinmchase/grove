import { HelloController } from "./hello/mod.ts";
import type { Context, State } from "../context.ts";
import type { Application } from "@oak/oak/application";
import { ErrorController } from "../../src/controllers/error.controller.ts";
import { HealthController } from "../../src/controllers/health.controller.ts";
import { IsHtmlController } from "../../src/controllers/parse.controller.ts";
import { LogController } from "../../src/controllers/log.controller.ts";
import { NotFoundController } from "../../src/controllers/not_found.controller.ts";

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
