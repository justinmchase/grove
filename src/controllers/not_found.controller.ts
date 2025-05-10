import type { Application, Context } from "@oak/oak";
import { Status, STATUS_TEXT } from "@oak/oak";
import type { IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";

/**
 * This module provides the not found controller for the Grove framework.
 * @module
 */

/**
 * NotFoundController is a controller that handles 404 Not Found errors.
 * It responds with a 404 status and a JSON body. Useful for use as a final
 * fallback controller to handle all requests that do not match any other routes.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 */
export class NotFoundController<
  TContext extends IContext,
  TState extends IState<TContext>,
> extends Controller<TContext, TState> {
  public async use(app: Application<TState>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context<TState>, _next: () => Promise<unknown>) {
    const status = Status.NotFound;
    const message = STATUS_TEXT[status];
    ctx.response.status = status;
    ctx.response.body = { ok: false, message };
    ctx.response.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
