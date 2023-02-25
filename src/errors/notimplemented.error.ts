import { Status } from "../../deps/oak.ts";
import { ApplicationError } from "./application.error.ts";

export class NotImplementedError extends ApplicationError {
  constructor(
    public readonly message = "not implemented",
  ) {
    super(
      Status.InternalServerError,
      "E_NOT_IMPLEMENTED",
      message,
    );
  }
}
