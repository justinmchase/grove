import { Status } from "@oak/oak";
import { ApplicationError } from "./application.error.ts";

export class ConfigError extends ApplicationError {
  constructor(
    public readonly key: string,
    public readonly reason: string,
  ) {
    super(
      Status.BadRequest,
      "E_CONFIGURATION",
      `Invalid configuration. Key [${key}] ${reason}.`,
    );
  }
}
