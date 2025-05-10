import { Status } from "@oak/oak";
import { Controller } from "./controller.ts";
import type { Application, Context } from "@oak/oak";
import type { IContext, IState } from "../context.ts";

/**
 * This module provides the error controller for the Grove framework.
 * @module
 */
/**
 * ErrorController is a controller that handles errors that occur during the
 * request lifecycle. It catches errors thrown in the request handler and
 * formats them into a standard response format. It also logs the error
 * using the logger in the context.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 * @extends {Controller<TContext, TState>} - The base controller class.
 */
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
      const { status = Status.InternalServerError, code, reason } =
        err as unknown as Record<
          string,
          unknown
        >;
      const { request: { ip, method, url } } = ctx;
      ctx.response.status = status as Status;
      ctx.response.body = { ok: false, status, message, code, reason };
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.state.context.logger.error(
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
