import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";
import type { Serializable } from "@justinmchase/serializable";

export class ExpectedError extends ApplicationError {
  constructor(
    public readonly propertyName: string,
    public readonly actualValue: Serializable,
    public readonly possibilities?: string[],
  ) {
    super(
      Status.BadRequest,
      "E_EXPECTED",
      [
        `The property ${propertyName} was expected but was actually ${
          JSON.stringify(actualValue)
        }`,
        possibilities ? `Possible values include [${possibilities}].` : "",
      ].filter((str) => str).join(". "),
    );
  }
}
