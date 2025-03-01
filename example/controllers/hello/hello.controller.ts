import { Router, Status } from "@oak/oak";
import type { Application, Request, Response } from "@oak/oak";
import type { Context, State } from "../../context.ts";
import type { HelloManager } from "../../managers/hello.manager.ts";
import type { Controller } from "../../../src/controllers/controller.ts";
import type { Logger } from "../../../src/logging/logger.interface.ts";

export class HelloController implements Controller<Context, State> {
  constructor(
    private readonly hellos: HelloManager,
  ) {
  }

  public async use(app: Application<State>): Promise<void> {
    const router = new Router<State>();
    router.post(
      "/hello",
      async (context, _next) =>
        await this.handler(
          context.state.context.log,
          context.request,
          context.response,
        ),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(logger: Logger, req: Request, res: Response) {
    const data = req.hasBody ? await req.body.json() : {};
    const { name = "World", punctuation = "!" } = data;
    const hello = await this.hellos.create({ name, punctuation });
    await logger.info(
      hello.greeting,
      hello,
    );
    res.status = Status.OK;
    res.body = {
      ok: true,
      greeting: hello.greeting,
    };
  }
}
