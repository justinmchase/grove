import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

/**
 * Represents an error that occurs when there is a configuration issue.
 * @extends ApplicationError
 */
export class ConfigError extends ApplicationError {
  constructor(
    public readonly key: string,
    reason: string,
  ) {
    super(
      Status.BadRequest,
      "E_CONFIGURATION",
      `Invalid configuration. Key [${key}] ${reason}.`,
    );
  }
}
