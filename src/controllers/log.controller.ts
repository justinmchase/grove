import { Application, Context } from "../../deps/oak.ts";
import { IServices, IContext, IState } from "../context.ts";
import { Controller } from "./controller.ts";
import { ILoggingService } from "../services/logging/mod.ts";

export class LogController<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> implements Controller<TServices, TContext, TState> {
  constructor(private readonly logging: ILoggingService) {
  }

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
      this.logging.info(
        "request",
        `${status} ${method} ${url} ${ms}`,
        {
          status,
          method,
          url,
          ms,
          ip,
        },
      );
    }
  }
}
