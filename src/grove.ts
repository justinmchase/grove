import { Application, Request, State } from "../deps/oak.ts";
import { ConsoleLoggingService, IServices } from "./services/services.ts";
import { IContext } from "./context.ts";

type InitServices<TServices extends IServices> = () => Promise<TServices>;
type InitControllers<TContext extends State, TServices extends IServices> = (
  app: Application<TContext>,
  services: TServices,
) => Promise<void>;

export interface IGroveConfig<
  TContext extends IContext,
  TServices extends IServices,
> {
  port?: number;
  hostname?: string;
  initServices?: InitServices<TServices>;
  initControllers?: InitControllers<TContext, TServices>;
}

export class Grove<
  TContext extends IContext,
  TServices extends IServices,
> {
  constructor(
    private readonly config: IGroveConfig<TContext, TServices>,
  ) {
  }

  private async defaultServices(): Promise<TServices> {
    return await {
      logging: new ConsoleLoggingService(),
    } as TServices;
  }

  private async defaultControllers(
    _app: Application<TContext>,
    _services: TServices,
  ): Promise<void> {
  }

  public async start() {
    const app = new Application<TContext>();
    const initServices = this.config.initServices ??
      this.defaultServices.bind(this);
    const initControllers = this.config.initControllers ??
      this.defaultControllers.bind(this);
    const services = await initServices();
    await initControllers(app, services);
    const { logging } = services;
    const { port = 8080, hostname = "0.0.0.0" } = this.config;

    logging.info("server_starting", `Server starting...`, { port });
    app.addEventListener("listen", (_event) => {
      logging.info("server_start", `Listening on http://localhost:${port}`, {
        port,
      });
    });
    app.addEventListener("error", (err) => {
      const { error, timeStamp, message, filename, lineno, context } = err;
      const { accepts, hasBody, headers, ips, method, url } =
        context?.request ||
        {} as Request;
      logging.error(
        "server_error",
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
