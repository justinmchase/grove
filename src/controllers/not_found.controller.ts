import type { IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";
import type { GroveApp, GroveRequestContext } from "./controller.ts";

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
export class NotFoundController extends Controller {
  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.notFound(this.handler.bind(this));
    await undefined;
  }

  private handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(ctx: GroveRequestContext<TContext, TState>) {
    return ctx.json({ ok: false, message: "Not Found" }, 404);
  }
}
