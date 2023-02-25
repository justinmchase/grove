import { accepts, Application, Request } from "../../deps/oak.ts";
import { IContext } from "../context.ts";
import { Controller } from "./controller.ts";

export class IsHtmlController<TContext extends IContext>
  extends Controller<TContext> {
  public async use(app: Application<TContext>): Promise<void> {
    app.use((ctx, next) => this.handler(ctx.request, ctx.state, next));
    await true;
  }

  private async handler(
    req: Request,
    context: TContext,
    next: () => Promise<unknown>,
  ) {
    // If requesting from a browser, this will be true. If requesting from curl or an app
    // then request either */* or application/* and the true content type will be added to the header.
    const isHtml = accepts(req, "application/*", "text/html") === "text/html";
    context.isHtml = isHtml;
    return await next();
  }
}
