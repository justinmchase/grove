import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * Represents an error that occurs when an unexpected status is received.
 * @extends ApplicationError
 */
export class UnexpectedStatusError extends ApplicationError {
  constructor(
    public readonly remoteUrl: string,
    public readonly expectedStatus: Status,
    public readonly actualStatus: Status,
  ) {
    super(
      Status.InternalServerError,
      "E_UNEXPECTED_STATUS",
      `Unexpected status ${actualStatus} was received while calling ${remoteUrl}, ${expectedStatus} was expected`,
    );
  }
}
