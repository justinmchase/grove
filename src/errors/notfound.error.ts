import { ObjectId } from "../../deps/mongo.ts";
import { Status } from "../../deps/oak.ts";
import { ApplicationError } from "./application.error.ts";

export class NotFoundError extends ApplicationError {
  constructor(
    public readonly type: string,
    public readonly id: string | ObjectId,
  ) {
    super(
      Status.NotFound,
      "E_NOT_FOUND",
      `${type} ${id} not found`,
    );
  }
}
