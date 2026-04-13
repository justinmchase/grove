import type { Context as HonoContext, Hono } from "@hono/hono";
import type { IContext, IState } from "../context.ts";

/**
 * This module provides the controller class for the Grove framework.
 * @module
 */

export type GroveEnv<
  TContext extends IContext,
  TState extends IState<TContext>,
> = {
  Variables: {
    state: TState;
  };
};

export type GroveApp<
  TContext extends IContext,
  TState extends IState<TContext>,
> = Hono<GroveEnv<TContext, TState>>;

export type GroveRequestContext<
  TContext extends IContext,
  TState extends IState<TContext>,
> = HonoContext<GroveEnv<TContext, TState>>;

/**
 * Abstract class representing a controller. The `use` method is called during the setup
 * and is intended to be used to setup routes when run in an api mode.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 */
export abstract class Controller {
  public abstract use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void>;
}
