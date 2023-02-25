import { Application } from "../../deps/oak.ts";
import { IContext } from "../context.ts";

export abstract class Controller<TContext extends IContext> {
  public abstract use(app: Application<TContext>): Promise<void>;
}
