import { load } from "@std/dotenv";
import { ConfigError } from "../errors/config.error.ts";

/**
 * This module provides basic configuration utilities for reading and parsing environment variables.
 * @module
 */

/**
 * Utilizies the `dotenv` module to load environment variables from a `.env` file.
 * @returns The combined environment variables from the `.env` file and the system environment.
 */
export async function getEnv(): Promise<Record<string, string>> {
  return {
    ...await load(),
    ...Deno.env.toObject(),
  };
}

/**
 * Reads an optional string from the environment variables.
 * @param env The environment variables.
 * @param key The key to read.
 * @returns The value of the key or undefined if not found.
 */
export function readOptionalString(
  env: Record<string, string>,
  key: string,
): string | undefined {
  return env[key];
}

/**
 * Reads a required string from the environment variables.
 * @param env The environment variables.
 * @param key The key to read.
 * @throws ConfigError if the key is not found.
 * @returns The value of the key.
 */
export function readRequiredString(
  env: Record<string, string>,
  key: string,
): string {
  if (env[key] == null) {
    throw new ConfigError(key, "is required");
  }
  return env[key];
}

/**
 * Reads an optional integer from the environment variables.
 * @param env The environment variables.
 * @param key The key to read.
 * @throws ConfigError if the value is not a valid integer.
 * @returns The number value of the key or undefined if not found.
 */
export function readOptionalInt(
  env: Record<string, string>,
  key: string,
): number | undefined {
  const value = env[key];
  if (value === undefined) {
    return undefined;
  }

  const parsedValue = parseInt(value);
  if (isNaN(parsedValue)) {
    throw new ConfigError(key, `(${value}) is not an integer`);
  }

  return parsedValue;
}

/**
 * Reads an optional boolean from the environment variables.
 * @param env The environment variables.
 * @param key The key to read.
 * @returns Undefined if the key is not found, otherwise true if the value is "1", "t", "true", "y", or "yes" (case insensitive) else false.
 */
export function readOptionalBoolean(
  env: Record<string, string>,
  key: string,
): boolean | undefined {
  const value = env[key];
  if (value == undefined) {
    return undefined;
  }
  return ["1", "t", "true", "y", "yes"].includes(value.toLowerCase());
}

/**
 * Reads a required boolean from the environment variables.
 * @param env The environment variables.
 * @param key The key to read.
 * @returns true if the value is "1", "t", "true", "y", or "yes" (case insensitive) else false.
 * @throws ConfigError if the key is not found.
 */
export function readRequiredBoolean(
  env: Record<string, string>,
  key: string,
): boolean {
  const value = readOptionalBoolean(env, key);
  if (value == undefined) {
    throw new ConfigError(key, "is required");
  }
  return value;
}
