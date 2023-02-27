import { accepts, Application, Request } from "../../deps/oak.ts";
import { Controller } from "./controller.ts";
import { IServices, IContext, IState } from "../context.ts";

export class IsHtmlController<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> implements Controller<TServices, TContext, TState> {

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
    const isHtml = accepts(req, "application/*", "text/html") === "text/html";
    state.isHtml = isHtml;
    return await next();
  }
}
