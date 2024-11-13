import { load } from "@std/dotenv";
import { ConfigError } from "../errors/config.error.ts";

export async function getEnv(): Promise<Record<string, string>> {
  return {
    ...await load(),
    ...Deno.env.toObject(),
  };
}

export function readOptionalString(
  env: Record<string, string>,
  key: string,
): string | undefined {
  return env[key];
}

export function readRequiredString(
  env: Record<string, string>,
  key: string,
): string {
  if (env[key] == null) {
    throw new ConfigError(key, "is required");
  }
  return env[key];
}

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
