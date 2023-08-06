import {
  Application,
  Controller,
  ILogger,
  Request,
  Response,
  Router,
  Status,
} from "../../../src/mod.ts";
import { Context, State } from "../../context.ts";
import { HelloManager } from "../../managers/hello.manager.ts";

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

  private async handler(log: ILogger, req: Request, res: Response) {
    const data = req.hasBody ? await req.body({ type: "json" }).value : {};
    const { name = "World", punctuation = "!" } = data;
    const hello = await this.hellos.create({ name, punctuation });
    await log.info(
      "hello",
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
