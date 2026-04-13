import type { Controller } from "./controller.ts";
import type { IContext, IState } from "../context.ts";
import type { GroveApp, GroveRequestContext } from "./controller.ts";

/**
 * This module provides the isHtml controller for the Grove framework.
 * @module
 */

/**
 * A controller that checks if the request is for HTML and sets the state accordingly.
 * It sets the `isHtml` property in the state to true if the request is for HTML.
 *
 * The request is considered for HTML if the `accepts` header is for either
 * `application/*` or `text/html`.
 *
 * This is useful for determining if the request is
 * coming from a browser or a non-browser client.
 * @template TContext - The type of the context.
 * @template TState - The type of the state.
 * @extends {Controller<TContext, TState>} - The base controller class.
 */
export class IsHtmlController implements Controller {
  public async use<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(app: GroveApp<TContext, TState>): Promise<void> {
    app.use("*", (ctx, next) => this.handler(ctx, next));
    await true;
  }

  private async handler<
    TContext extends IContext,
    TState extends IState<TContext>,
  >(
    ctx: GroveRequestContext<TContext, TState>,
    next: () => Promise<unknown>,
  ) {
    // If requesting from a browser, this will be true. If requesting from curl or an app
    // then request either */* or application/* and the true content type will be added to the header.
    const acceptHeader = ctx.req.header("accept") ?? "";
    const isHtml = acceptHeader.includes("application/*") ||
      acceptHeader.includes("text/html");
    const state = ctx.get("state");
    state.isHtml = isHtml;
    return await next();
  }
}
