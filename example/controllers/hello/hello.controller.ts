import {
  Application,
  Controller,
  Request,
  Response,
  Router,
  Status,
  ILoggingService
} from "../../../src/mod.ts";
import { Services, Context, State } from "../../context.ts";
import { HelloManager } from "../../managers/hello.manager.ts";

export class HelloController extends Controller<Services, Context, State> {
  constructor(
    private readonly logging: ILoggingService,
    private readonly hellos: HelloManager,
  ) {
    super();
  }
  
  public async use(app: Application<State>): Promise<void> {
    const router = new Router<State>();
    router.post(
      "/hello",
      async (context, _next) => await this.handler(context.request, context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }
  
  private async handler(req: Request, res: Response) {
    const data = req.hasBody
      ? await req.body({ type: "json" }).value
      : {};
    const { name = "World", punctuation = "!" } = data;
    const hello = await this.hellos.create({ name, punctuation })
    await this.logging.info(
      'hello',
      hello.greeting,
      hello,
    )
    res.status = Status.OK;
    res.body = {
      ok: true,
      greeting: hello.greeting
    }
  }
}