import { Application, Response, Router, Status } from "../../deps/oak.ts";
import { IServices, IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";

export class HealthController<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> implements Controller<TServices, TContext, TState> {
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
