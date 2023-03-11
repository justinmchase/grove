import { Application } from "../../deps/oak.ts";
import { IContext, IState } from "../context.ts";

export abstract class Controller<
  TContext extends IContext,
  TState extends IState<TContext>,
> {
  public abstract use(app: Application<TState>): Promise<void>;
}
