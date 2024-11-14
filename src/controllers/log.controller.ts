import type { Application, Context } from "@oak/oak";
import type { IContext, IState } from "../context.ts";
import type { Controller } from "./controller.ts";

export class LogController<
  TContext extends IContext,
  TState extends IState<TContext>,
> implements Controller<TContext, TState> {
  public async use(app: Application<TState>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context<TState>, next: () => Promise<unknown>) {
    const start = new Date().valueOf();
    const { request: { ip, method, url } } = ctx;
    try {
      await next();
    } finally {
      const end = new Date().valueOf();
      const t = end - start;
      const ms = `${t}ms`;
      const { response: { status } } = ctx;
      ctx.state.context.log.info(
        `${status} ${method} ${url.pathname} ${ms}`,
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
