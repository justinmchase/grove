import { Application } from "../../deps/oak.ts";
import { IContext, IServices, IState } from "../context.ts";

export abstract class Controller<
  TServices extends IServices,
  TContext extends IContext<TServices>,
  TState extends IState<TServices, TContext>,
> {
  public abstract use(app: Application<TState>): Promise<void>;
}
