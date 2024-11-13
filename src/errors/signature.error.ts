import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

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
