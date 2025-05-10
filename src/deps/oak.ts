import * as oak from "@oak/oak";

/**
 * @module
 * This module provides an Oak client compatible with the current version of Grove.
 *
 * @example
 * ```ts
 * import { oak } from "@justinmchase/grove/deps";
 *
 * const app = new oak.Application();
 * app.use((ctx) => {
 *   ctx.response.body = "Hello, World!";
 * });
 * ```
 */

export {
  /**
   * @oak/oak module compatible with this version of Grove.
   */
  oak,
};
