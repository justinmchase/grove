import type { ErrorCode } from "./errorCode.ts";
import type { Status } from "@oak/oak";

/**
 * This module provides a custom error class for the application.
 * @module
 */

/**
 * Custom error class for application errors.
 * This class extends the built-in Error class and includes additional properties
 * such as status, code, and reason.
 * It is used to represent errors that occur within the application and
 * provide a standard structure for error handling.
 */
export class ApplicationError extends Error {
  constructor(
    public readonly status: Status,
    public readonly code: ErrorCode,
    message: string,
    public readonly reason?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
