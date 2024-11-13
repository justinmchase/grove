import type { Application, Context } from "@oak/oak";
import { Status, STATUS_TEXT } from "@oak/oak";
import type { IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";

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
