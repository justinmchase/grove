import type { ContentfulStatusCode } from "@hono/hono/utils/http-status";
import { ApplicationError } from "./application.error.ts";

/**
 * This module provides a custom error class for unexpected status errors.
 * @module
 */

/**
 * Represents an error that occurs when an unexpected status is received.
 * @extends ApplicationError
 */
export class UnexpectedStatusError extends ApplicationError {
  constructor(
    public readonly remoteUrl: string,
    public readonly expectedStatus: ContentfulStatusCode,
    public readonly actualStatus: number,
  ) {
    super(
      500,
      "E_UNEXPECTED_STATUS",
      `Unexpected status ${actualStatus} was received while calling ${remoteUrl}, ${expectedStatus} was expected`,
    );
  }
}
