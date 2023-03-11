import { Status } from "../../deps/oak.ts";
import { Serializable } from "../util/serializable.ts";
import { ApplicationError } from "./application.error.ts";

export class ExpectedError extends ApplicationError {
  constructor(
    public readonly name: string,
    public readonly actualValue: Serializable,
    public readonly possibilities?: string[],
  ) {
    super(
      Status.BadRequest,
      "E_EXPECTED",
      [
        `The property ${name} was expected but was actually ${
          JSON.stringify(actualValue)
        }`,
        possibilities ? `Possible values include [${possibilities}].` : "",
      ].filter((str) => str).join(". "),
    );
  }
}
