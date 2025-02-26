import { Status } from "@oak/oak";
import { Controller } from "./controller.ts";
import type { Application, Context } from "@oak/oak";
import type { IContext, IState } from "../context.ts";

export class ErrorController<
  TContext extends IContext,
  TState extends IState<TContext>,
> extends Controller<TContext, TState> {
  public async use(app: Application<TState>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context<TState>, next: () => Promise<unknown>) {
    const start = new Date().valueOf();
    try {
      await next();
    } catch (e) {
      const end = new Date().valueOf();
      const t = end - start;
      const ms = `${t}ms`;
      const err = e instanceof Error
        ? e
        : new Error("An unknown error occurred", { cause: e });
      const { message } = err instanceof Error
        ? err
        : { message: "An unknown error occurred" };
      const { status = Status.InternalServerError, code, warning } =
        err as unknown as Record<
          string,
          unknown
        >;
      const { request: { ip, method, url } } = ctx;
      ctx.response.status = status as Status;
      ctx.response.body = { ok: false, status, message, code, warning };
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.state.context.log.error(
        `An unhandled error occurred: ${message}`,
        err,
        {
          status,
          method,
          url: `${url}`,
          ms,
          ip,
        },
      );
    }
  }
}
