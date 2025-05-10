import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * This module provides a custom error class for signature errors.
 * @module
 */

/**
 * Represents an error that occurs when a signature is invalid.
 * @extends ApplicationError
 */
export class SignatureError extends ApplicationError {
  constructor(details?: string) {
    super(
      Status.Unauthorized,
      "E_SIGNATURE",
      "invalid signature",
      details,
    );
  }
}
