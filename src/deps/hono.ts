import * as hono from "@hono/hono";

/**
 * @module
 * This module provides a Hono client compatible with the current version of Grove.
 *
 * @example
 * ```ts
 * import { hono } from "@justinmchase/grove/deps";
 *
 * const app = new hono.Hono();
 * app.get("/", (ctx) => ctx.text("Hello, World!"));
 * ```
 */

export {
  /**
   * @hono/hono module compatible with this version of Grove.
   */
  hono,
};
