import { dotenv } from "../../deps/dotenv.ts";
import { ConfigError } from "../errors/config.error.ts";

export async function getEnv() {
  return {
    ...await dotenv(),
    ...Deno.env.toObject(),
  };
}

export function readString(
  env: Record<string, string>,
  key: string,
  defaultValue?: string,
) {
  return env[key] ?? defaultValue;
}

export function readRequiredString(env: Record<string, string>, key: string) {
  if (env[key] == null) {
    throw new ConfigError(key, "is required");
  }
  return env[key];
}

export function readInt(
  env: Record<string, string>,
  key: string,
  defaultValue: number,
) {
  const value = env[key];
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = parseInt(value);
  if (isNaN(parsedValue)) {
    throw new ConfigError(key, `(${value}) is not an integer`);
  }

  return parsedValue;
}
