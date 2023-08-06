import { Status } from "../../deps/oak.ts";
import { ApplicationError } from "./application.error.ts";

export class EmptyError extends ApplicationError {
  constructor(
    public readonly reason: string,
  ) {
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
