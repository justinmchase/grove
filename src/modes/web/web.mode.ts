import type { Request } from "@oak/oak/request";
import { Application } from "@oak/oak/application";
import { Type } from "@justinmchase/type";
import type { IContext, IState } from "../../context.ts";
import type { IMode, IModeOption } from "../mode.interface.ts";

type WebArgs = {
  port?: number;
  hostname?: string;
};

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
  public description = "Runs a webserver until closed";

  constructor(
    private readonly config: IWebModeConfig<TContext, TState>,
  ) {
  }

  public getOptions(): IModeOption[] {
    return [
      {
        type: Type.Number,
        name: "port",
        description: "The port to listen on",
        defaultValue: this.config.port ?? 8000,
      },
      {
        type: Type.String,
        name: "hostname",
        description: "The hostname interface to listen on",
        defaultValue: this.config.hostname ?? "0.0.0.0",
      },
    ];
  }

  public getModes(): IMode<TContext>[] {
    return [];
  }

  public async run(args: WebArgs, context: TContext) {
    const { port, hostname } = args;
    context.logger.info(`Server starting...`, { port });
    const app = new Application<TState>();
    app.use(async (ctx, next) => {
      ctx.state.context = context;
      await next();
    });
    await this.config.initControllers(context, app);
    app.addEventListener("listen", (_event) => {
      context.logger.info(
        `Listening on http://${hostname}:${port}`,
        { port },
      );
    });
    app.addEventListener("error", (err) => {
      const { error, timeStamp, message, filename, lineno } = err;
      const { accepts, hasBody, headers, ips, method, url } =
        err.context?.request ||
        {} as Request;
      context.logger.error(
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
