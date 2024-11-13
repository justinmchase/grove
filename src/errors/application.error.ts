import type { ErrorCode } from "./errorCode.ts";
import type { Status } from "@oak/oak";

export class ApplicationError extends Error {
  constructor(
    public readonly status: Status,
    public readonly code: ErrorCode,
    message: string,
    public readonly warning?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
