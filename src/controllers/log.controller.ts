import type { IContext, IState } from "../context.ts";
import type { Controller } from "./controller.ts";
import type { GroveApp, GroveRequestContext } from "./controller.ts";

/**
 * This module provides the log controller for the Grove framework.
 * @module
 */

/**
 * A logging controller that logs the request and response information.
 * It logs the status, method, URL, and time taken to process the request.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 * @extends {Controller<TContext, TState>} - The base controller class.
 */
export class LogController implements Controller {
  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    ctx: GroveRequestContext<TContext, TState>,
    next: () => Promise<unknown>,
  ) {
    const start = new Date().valueOf();
    const { method } = ctx.req;
    const url = new URL(ctx.req.url);
    try {
      await next();
    } finally {
      const end = new Date().valueOf();
      const t = end - start;
      const ms = `${t}ms`;
      const status = ctx.res.status;
      ctx.get("state").context.logger.info(
        `${status} ${method} ${url.pathname} ${ms}`,
        {
          status,
          method,
          url: `${url}`,
          ms,
        },
      );
    }
  }
}
