import type { WithPrefix } from "../util/withPrefix.ts";

/**
 * Error codes are prefixed with "E_" to indicate that they are error codes.
 * This is used to differentiate them from other types of codes in the system.
 */
export type ErrorCode = WithPrefix<"E_">;
