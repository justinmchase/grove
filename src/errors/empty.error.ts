import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * This module provides a custom error class for empty set errors.
 * @module
 */

/**
 * Represents an error that occurs when a set is unexpectedly empty.
 * @extends ApplicationError
 */
export class EmptyError extends ApplicationError {
  constructor(reason: string) {
    super(
      Status.BadRequest,
      "E_EMPTY",
      `A set was unexpectedly empty. ${reason}`,
    );
  }

  /**
   * Throws an EmptyError if the provided array is unexpectedly empty.
   * @param items The set to check.
   * @param reason The reason for the error.
   * @throws {EmptyError} If the set is empty.
   */
  public static ThrowIfEmpty(items: unknown[], reason: string) {
    if (!items.length) {
      throw new EmptyError(reason);
    }
  }
}
