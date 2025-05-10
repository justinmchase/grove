/**
 * This module provides a utility type for creating string types with a prefix.
 * @module
 */

/**
 * A utility type that represents a string with a prefix.
 * This is useful for creating types that require a specific prefix.
 * @param T The prefix string.
 * @example
 * ```ts
 * type UNum = WithPrefix<"U">;
 * const example: UNum = "U1234";
 * ```
 */
export type WithPrefix<T extends string> = `${T}${string}`;
