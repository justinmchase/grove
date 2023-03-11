import { IContext } from "../context.ts";
import { Type } from "../util/type.ts";

export interface IModeOption {
  type: Type.String | Type.Number | Type.Boolean;
  name: string;
  description: string;
  values?: string[];
  required?: boolean;
  defaultValue?: unknown;
}

export interface IMode<TContext extends IContext> {
  name: string;
  description: string;
  getOptions(): IModeOption[];
  getModes(): IMode<TContext>[];

  run(args: unknown, context: TContext): Promise<void>;
}
