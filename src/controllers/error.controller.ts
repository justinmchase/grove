import { isNumber } from "@justinmchase/type";
import { Controller } from "./controller.ts";
import type { GroveApp, GroveRequestContext } from "./controller.ts";
import type { IContext, IState } from "../context.ts";
import type { ContentfulStatusCode } from "@hono/hono/utils/http-status";

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
export class ErrorController extends Controller {
  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.onError(this.handler.bind(this));
    await undefined;
  }

  private handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    e: unknown,
    ctx: GroveRequestContext<TContext, TState>,
  ) {
    const err = e instanceof Error
      ? e
      : new Error("An unknown error occurred", { cause: e });
    const { message } = err;
    const { status = 500, code, reason } = err as unknown as Record<
      string,
      unknown
    >;
    const method = ctx.req.method;
    const url = ctx.req.url;
    ctx.get("state").context.logger.error(
      `An unhandled error occurred: ${message}`,
      err,
      {
        status,
        method,
        url,
      },
    );

    const responseStatus = isNumber(status) ? status : 500;
    return ctx.json({
      ok: false,
      status: responseStatus,
      message,
      code,
      reason,
    }, responseStatus as ContentfulStatusCode);
  }
}
