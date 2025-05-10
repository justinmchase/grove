import type { Application } from "@oak/oak";
import type { IContext, IState } from "../context.ts";

/**
 * This module provides the controller class for the Grove framework.
 * @module
 */

/**
 * Abstract class representing a controller. The `use` method is called during the setup
 * and is intended to be used to setup routes when run in an api mode.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 */
export abstract class Controller<
  TContext extends IContext,
  TState extends IState<TContext>,
> {
  public abstract use(app: Application<TState>): Promise<void>;
}
