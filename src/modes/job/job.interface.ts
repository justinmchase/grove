import { IContext } from "../../context.ts";
import { IModeOption } from "../mode.interface.ts";

export interface IJob<TContext extends IContext> {
  name: string;
  description: string;
  getOptions(): IModeOption[];
  run(args: unknown, context: TContext): Promise<void>;
}
