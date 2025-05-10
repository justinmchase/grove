import { Router, Status } from "@oak/oak";
import type { Application, Response } from "@oak/oak";
import type { IContext, IState } from "../context.ts";
import type { Controller } from "./controller.ts";

/**
 * This module provides the health controller for the Grove framework.
 * @module
 */

/**
 * A basic health check controller that responds with a 200 OK status and a JSON body at `GET /health`.
 */
export class HealthController<
  TContext extends IContext,
  TState extends IState<TContext>,
> implements Controller<TContext, TState> {
  public async use(app: Application<TState>): Promise<void> {
    const router = new Router();
    router.get(
      "/health",
      async (context, _next) => await this.handler(context.response),
    );
    app.use(router.allowedMethods());
    app.use(router.routes());
    await undefined;
  }

  private async handler(res: Response) {
    res.status = Status.OK;
    res.body = { ok: true };
    res.headers.set("Content-Type", "application/json");
    await undefined;
  }
}
