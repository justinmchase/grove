import type { IContext, IState } from "../context.ts";
import type { Controller } from "./controller.ts";
import type { GroveApp, GroveRequestContext } from "./controller.ts";

/**
 * This module provides the health controller for the Grove framework.
 * @module
 */

/**
 * A basic health check controller that responds with a 200 OK status and a JSON body at `GET /health`.
 */
export class HealthController implements Controller {
  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.get("/health", async (ctx) => await this.handler(ctx));
    await undefined;
  }

  private handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(ctx: GroveRequestContext<TContext, TState>) {
    return ctx.json({ ok: true }, 200);
  }
}
