import { Hono } from "@hono/hono";
import { Type } from "@justinmchase/type";
import type { IContext, IState } from "../../context.ts";
import type { GroveApp, GroveEnv } from "../../controllers/controller.ts";
import type { IMode, IModeOption, IRunContext } from "../mode.interface.ts";

/**
 * This module provides the web mode for the application.
 * @module
 */

type WebArgs = {
  port?: number;
  hostname?: string;
};

/**
 * IWebModeConfig is the interface that will be used to create the web mode.
 * This mode will run a webserver until closed.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 */
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
  app: GroveApp<TContext, TState>,
) => Promise<void>;

/**
 * WebMode is the class that will be used to create the web mode.
 * This mode will run a webserver until closed.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 */
export class WebMode<TContext extends IContext, TState extends IState<TContext>>
  implements IMode<TContext> {
  public name = "web";
  public description = "Runs a webserver until closed";

  constructor(
    private readonly config: IWebModeConfig<TContext, TState>,
  ) {
  }

  /**
   * The options that will be used to run the mode. This is the list of options that will be
   * available to the user when running the mode.
   * @returns {IModeOption[]} port and hostname options
   */
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

  /**
   * The sub modes that will be available in the mode. This is the list of sub modes that will be
   * available to the user when running the mode.
   * @returns {IMode<TContext>[]} empty array
   */
  public getModes(): IMode<TContext>[] {
    return [];
  }

  /**
   * The function that will be called to run the mode.
   * The mode will run a webserver until closed.
   * @param {WebArgs} args - The arguments that will be passed to the mode.
   * @param {TContext} context - The context that will be passed to the mode.
   * @param {IRunContext} runContext - Runtime context including optional abort signal.
   */
  public async run(args: WebArgs, context: TContext, runContext?: IRunContext) {
    const port = args.port ?? this.config.port ?? 8000;
    const hostname = args.hostname ?? this.config.hostname ?? "0.0.0.0";
    context.logger.info(`Server starting...`, { port, hostname });
    const app = new Hono<GroveEnv<TContext, TState>>();
    app.use("*", async (ctx, next) => {
      ctx.set("state", { context } as TState);
      await next();
    });
    await this.config.initControllers(context, app);

    context.logger.info(
      `Listening on http://${hostname}:${port}`,
      { port, hostname },
    );

    const server = Deno.serve(
      { hostname, port, signal: runContext?.signal },
      app.fetch,
    );

    await runContext?.ready?.();
    await server.finished;
  }
}
