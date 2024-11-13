import type { Application, Request } from "@oak/oak";
import type { Controller } from "./controller.ts";
import type { IContext, IState } from "../context.ts";

export class IsHtmlController<
  TContext extends IContext,
  TState extends IState<TContext>,
> implements Controller<TContext, TState> {
  public async use(app: Application<TState>): Promise<void> {
    app.use((ctx, next) => this.handler(ctx.request, ctx.state, next));
    await true;
  }

  private async handler(
    req: Request,
    state: TState,
    next: () => Promise<unknown>,
  ) {
    // If requesting from a browser, this will be true. If requesting from curl or an app
    // then request either */* or application/* and the true content type will be added to the header.
    const isHtml = !!req.accepts("application/*", "text/html");
    state.isHtml = isHtml;
    return await next();
  }
}
