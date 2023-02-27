import { Application, Context, Status } from "../../deps/oak.ts";
import { IContext, IServices, IState } from "../context.ts";
import { Controller } from "./controller.ts";
import { ILoggingService } from "../services/mod.ts";

export class ErrorController<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> extends Controller<TServices, TContext, TState> {
  constructor(private readonly logging: ILoggingService) {
    super();
  }

  public async use(app: Application<TState>): Promise<void> {
    app.use(this.handler.bind(this));
    await undefined;
  }

  private async handler(ctx: Context<TState>, next: () => Promise<unknown>) {
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
