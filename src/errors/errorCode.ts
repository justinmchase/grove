import type { WithPrefix } from "../util/withPrefix.ts";

/**
 * This module provides a type for error codes with a specific prefix.
 * @module
 */

/**
 * Error codes are prefixed with "E_" to indicate that they are error codes.
 * This is used to differentiate them from other types of codes in the system.
 */
export type ErrorCode = WithPrefix<"E_">;
