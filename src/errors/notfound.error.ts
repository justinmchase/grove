import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * This module provides a custom error class for not found errors.
 * @module
 */

/**
 * Represents an error that occurs when a requested resource is not found.
 */
export class NotFoundError extends ApplicationError {
  constructor(
    public readonly type: string,
    public readonly id: string,
  ) {
    super(
      Status.NotFound,
      "E_NOT_FOUND",
      `${type} ${id} not found`,
    );
  }
}
