import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * This module provides a custom error class for not implemented errors.
 * @module
 */

/**
 * Represents an error that occurs when a feature is not implemented.
 * @extends ApplicationError
 */
export class NotImplementedError extends ApplicationError {
  constructor(
    public readonly details: string,
  ) {
    super(
      Status.InternalServerError,
      "E_NOT_IMPLEMENTED",
      "not implemented",
    );
  }
}
