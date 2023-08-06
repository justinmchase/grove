import { Status } from "../../deps/oak.ts";
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
