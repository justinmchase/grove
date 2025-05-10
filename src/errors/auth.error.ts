import { Status, STATUS_TEXT } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * This module provides a custom error class for authentication errors.
 * @module
 */

/**
 * AuthKind is a type that represents the kind of authentication error.
 * "authc" indicates an authentication error, while "authz" indicates an authorization error.
 */
export type AuthKind = "authc" | "authz";

/**
 * Custom error class for authentication errors.
 * This class extends the ApplicationError class and is used
 * to represent errors that occur during authentication and authorization processes.
 */
export class AuthError extends ApplicationError {
  constructor(public readonly kind: AuthKind, reason: string) {
    super(
      Status.Unauthorized,
      "E_AUTHENTICATION",
      STATUS_TEXT[Status.Unauthorized],
      `failed ${kind} ${reason}`,
    );
  }
}
