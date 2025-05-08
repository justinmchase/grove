import type { Type } from "@justinmchase/type";
import type { IContext } from "../context.ts";

/**
 * IModeOption is the interface that will be used to create the options for each mode.
 */
export interface IModeOption {
  type: Type.String | Type.Number | Type.Boolean;
  name: string;
  description: string;
  values?: string[];
  required?: boolean;
  defaultValue?: unknown;
}

/**
 * A grove application exports one or more IModes. Each mode is a command that can be executed.
 * The hybrid nature of Grove allows for different aspects of the application to all exist in 
 * the same codebase but as different modes. Each process only runs a single mode at a time.
 *
 * Therefore, you implement multiple modes and then run the service in different multiple
 * processes, each running a different mode.
 */
export interface IMode<TContext extends IContext> {
  name: string;
  description: string;
  getOptions(): IModeOption[];
  getModes(): IMode<TContext>[];

  run(args: unknown, context: TContext): Promise<void>;
}
