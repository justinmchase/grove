import type { HelloManager } from "../../managers/hello.manager.ts";
import type {
  Controller,
  GroveApp,
  GroveRequestContext,
} from "../../../src/controllers/controller.ts";
import type { IContext, IState } from "../../../src/context.ts";

export class HelloController implements Controller {
  constructor(
    private readonly hellos: HelloManager,
  ) {
  }

  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.post("/hello", async (ctx) => await this.handler(ctx));
    await undefined;
  }

  private async handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(ctx: GroveRequestContext<TContext, TState>) {
    const logger = ctx.get("state").context.logger;
    const data = await ctx.req.json().catch(() => ({}));
    const { name = "World", punctuation = "!" } = data;
    const hello = await this.hellos.create({ name, punctuation });
    await logger.info(
      hello.greeting,
      hello,
    );
    return ctx.json({
      ok: true,
      greeting: hello.greeting,
    }, 200);
  }
}
