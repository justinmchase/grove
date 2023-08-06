import { Application, Context, Status } from "../../deps/oak.ts";
import { IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";

export class ErrorController<
  TContext extends IContext,
  TState extends IState<TContext>,
> extends Controller<TContext, TState> {
  public async use(app: Application<TState>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context<TState>, next: () => Promise<unknown>) {
    try {
      await next();
    } catch (err) {
      const { message } = err;
      const status = err.status ?? Status.InternalServerError;
      const { request: { ip, method, url } } = ctx;
      ctx.response.status = status;
      ctx.response.body = { ok: false, message };
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.state.context.log.error(
        "server_error",
        `An unhandled error occurred: ${message}`,
        err,
        {
          method,
          url,
          status,
          ip,
        },
      );
    }
  }
}
