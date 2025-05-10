import type { IContext } from "../../context.ts";
import type { IModeOption } from "../mode.interface.ts";

/**
 * This module provides the job mode for the application.
 * @module
 */

/**
 * IJob is the interface that will be used to create a job.
 */
export interface IJob<TContext extends IContext> {
  name: string;
  description: string;
  getOptions(): IModeOption[];
  run(args: unknown, context: TContext): Promise<void>;
}
