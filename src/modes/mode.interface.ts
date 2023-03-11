import { IContext } from "../context.ts";

export interface IMode<TContext extends IContext> {
  name: string;
  run(context: TContext): Promise<void>;
}
