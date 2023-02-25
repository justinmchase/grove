import { Application, Context } from "../../deps/oak.ts";
import { IContext } from "../context.ts";
import { Controller } from "./controller.ts";
import { ILoggingService } from "../services/logging/mod.ts";

export class LogController<TContext extends IContext>
  extends Controller<TContext> {
  constructor(private readonly logging: ILoggingService) {
    super();
  }

  public async use(app: Application<TContext>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context, next: () => Promise<unknown>) {
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
