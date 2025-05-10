import type { State } from "@oak/oak";
import type { Logger } from "./logging/mod.ts";

/**
 * This module provides the context and state interface for the Grove framework.
 * @module
 */

/**
 * IContext is the interface that will be used to create the application context.
 */
export interface IContext {
  /**
   * The default logger that will be used to log messages.
   */
  logger: Logger;
}

/**
 * IState is an extensible interface that will will contain the state of a request
 * which middleware may use to store information about the request.
 */
export interface IState<
  TContext extends IContext,
> extends State {
  /**
   * The context of a request.
   */
  context: TContext;
  /**
   * Whether or not the request is for html from a browser.
   */
  isHtml?: boolean;
}
