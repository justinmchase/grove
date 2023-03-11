import { IContext, IState } from "../../context.ts";
import { Application, Request } from "../../../deps/oak.ts";
import { IMode } from "../mode.interface.ts";

export interface IWebModeConfig<
  TContext extends IContext,
  TState extends IState<TContext>,
> {
  port?: number;
  hostname?: string;
  initControllers: InitControllers<TContext, TState>;
}

type InitControllers<
  TContext extends IContext,
  TState extends IState<TContext>,
> = (
  context: TContext,
  app: Application<TState>,
) => Promise<void>;

export class WebMode<TContext extends IContext, TState extends IState<TContext>>
  implements IMode<TContext> {
  public name = "web";

  constructor(
    private readonly config: IWebModeConfig<TContext, TState>,
  ) {
  }

  public async run(context: TContext) {
    const { port = 8080, hostname = "0.0.0.0" } = this.config;
    context.log.info("grove_web_start", `Server starting...`, { port });
    const app = new Application<TState>();
    await this.config.initControllers(context, app);

    app.addEventListener("listen", (_event) => {
      context.log.info(
        "grove_web_listening",
        `Listening on http://localhost:${port}`,
        {
          port,
        },
      );
    });
    app.addEventListener("error", (err) => {
      const { error, timeStamp, message, filename, lineno } = err;
      const { accepts, hasBody, headers, ips, method, url } =
        err.context?.request ||
        {} as Request;
      context.log.error(
        "grove_web_error",
        `unexpected server error: ${err.message}`,
        {
          timeStamp,
          message,
          filename,
          lineno,
          accepts,
          hasBody,
          headers,
          ips,
          method,
          url,
          ...error,
        },
        error,
      );
    });
    await app.listen({ hostname, port });
  }
}
