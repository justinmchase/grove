import type { Type } from "@justinmchase/type";
import type { IContext } from "../context.ts";

/**
 * This module provides the IMode and IModeOption interfaces for defining modes in the Grove framework.
 * @module
 */

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
  /**
   * The name of the mode. This is the name that will be used to determine which mode to run.
   */
  name: string;
  /**
   * The description of the mode. This is the description that will be shown in the help message.
   */
  description: string;
  /**
   * The options that will be used to run the mode. This is the list of options that will be
   * available to the user when running the mode.
   */
  getOptions(): IModeOption[];
  /**
   * The sub modes that will be available in the mode. This is the list of sub modes that will
   * be available to the user when running the mode.
   */
  getModes(): IMode<TContext>[];
  /**
   * The function that will be called to run the mode.
   * This function should return a promise that resolves when the mode is done.
   */
  run(args: unknown, context: TContext): Promise<void>;
}
