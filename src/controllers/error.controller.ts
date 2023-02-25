import { Application, Context, Status } from "../../deps/oak.ts";
import { IContext } from "../context.ts";
import { Controller } from "./controller.ts";
import { ILoggingService } from "../services/mod.ts";

export class ErrorController<TContext extends IContext>
  extends Controller<TContext> {
  constructor(private readonly logging: ILoggingService) {
    super();
  }

  public async use(app: Application<TContext>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context<TContext>, next: () => Promise<unknown>) {
    try {
      await next();
    } catch (err) {
      const { message } = err;
      const status = err.status ?? Status.InternalServerError;
      const { request: { ip, method, url } } = ctx;
      ctx.response.status = status;
      ctx.response.body = { ok: false, message };
      ctx.response.headers.set("Content-Type", "application/json");
      this.logging.error(
        "server_error",
        `An unhandled error occurred: ${message}`,
        err,
        {
          method,
          url,
          status,
          ip,
        },
      );
    }
  }
}
