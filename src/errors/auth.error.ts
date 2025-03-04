import { Status, STATUS_TEXT } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

export type AuthKind = "authc" | "authz";

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
