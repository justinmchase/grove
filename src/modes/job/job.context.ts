import type { IContext } from "../../context.ts";

/**
 * This module provides the job context for the application.
 * @module
 */

/**
 * IJobContext is the interface that will be used to create the job context.
 */
export interface IJobContext extends IContext {
  name: string;
}
