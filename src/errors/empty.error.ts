import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

export class EmptyError extends ApplicationError {
  constructor(reason: string) {
    super(
      Status.BadRequest,
      "E_EMPTY",
      `A set was unexpectedly empty. ${reason}`,
    );
  }

  public static ThrowIfEmpty(items: unknown[], reason: string) {
    if (!items.length) {
      throw new EmptyError(reason);
    }
  }
}
