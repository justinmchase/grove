import { Application, Request } from "../deps/oak.ts";
import { ConsoleLoggingService } from "./services/mod.ts";
import { IServices, IContext, IState } from "./context.ts";

type InitApplicationContext<
  TServices extends IServices,
  TContext extends IContext<TServices>,
> = () => Promise<TContext>;

type InitControllers<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> = (
  context: TContext,
  app: Application<TState>,
) => Promise<void>;

export interface IGroveConfig<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> {
  port?: number;
  hostname?: string;
  initContext?: InitApplicationContext<TServices, TContext>;
  initControllers?: InitControllers<TServices, TContext, TState>;
}

export class Grove<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> {
  constructor(
    private readonly config: IGroveConfig<TServices, TContext, TState>,
  ) {
  }

  private async defaultContext(): Promise<TContext> {
    return await {
      services: {
        logging: new ConsoleLoggingService(),
      },
    } as TContext;
  }

  private async defaultControllers(
    _context: TContext,
    _app: Application<TState>,
  ): Promise<void> {
  }

  public async start() {
    const app = new Application<TState>();

    // Initialize context
    const context = this.config.initContext
      ? await this.config.initContext()
      : await this.defaultContext();

    // Initialize controllers
    if (this.config.initControllers) {
      await this.config.initControllers(context, app);
    } else {
      await this.defaultControllers(context, app);
    }

    const { services: { logging } } = context;
    const { port = 8080, hostname = "0.0.0.0" } = this.config;

    logging.info("server", `Server starting...`, { port });
    app.addEventListener("listen", (_event) => {
      logging.info("server", `Listening on http://localhost:${port}`, {
        port,
      });
    });
    app.addEventListener("error", (err) => {
      const { error, timeStamp, message, filename, lineno, context } = err;
      const { accepts, hasBody, headers, ips, method, url } =
        context?.request ||
        {} as Request;
      logging.error(
        "server",
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
