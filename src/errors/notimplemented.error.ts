import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

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
