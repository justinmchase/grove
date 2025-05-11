import { assertEquals, assertThrows } from "@std/assert";
import { ConfigError } from "../errors/config.error.ts";
import {
  readOptionalBoolean,
  readOptionalInt,
  readOptionalString,
  readRequiredString,
} from "./config.ts";
import { readRequiredBoolean } from "./mod.ts";

Deno.test({
  name: "config_readString_00",
  fn: () => {
    const actual = readOptionalString({ a: "abc" }, "a");
    assertEquals(actual, "abc");
  },
});
Deno.test({
  name: "config_readString_01",
  fn: () => {
    const actual = readOptionalString({ a: "abc" }, "b") ?? "xyz";
    assertEquals(actual, "xyz");
  },
});
Deno.test({
  name: "config_readRequiredString_00",
  fn: () => {
    const actual = readRequiredString({ a: "abc" }, "a");
    assertEquals(actual, "abc");
  },
});
Deno.test({
  name: "config_readRequiredString_01",
  fn: () => {
    assertThrows(
      () => readRequiredString({ a: "abc" }, "b"),
      ConfigError,
      "Invalid configuration. Key [b] is required.",
      "Configuration is invalid",
    );
  },
});
Deno.test({
  name: "config_readInt_00",
  fn: () => {
    const actual = readOptionalInt({ a: "1" }, "a") ?? 0;
    assertEquals(actual, 1);
  },
});
Deno.test({
  name: "config_readInt_01",
  fn: () => {
    const actual = readOptionalInt({ a: "1" }, "b") ?? 7;
    assertEquals(actual, 7);
  },
});
Deno.test({
  name: "config_readInt_02",
  fn: () => {
    assertThrows(
      () => readOptionalInt({ a: "xyz" }, "a"),
      ConfigError,
      "Invalid configuration. Key [a] (xyz) is not an integer.",
      "readInt is expected to throw but isn't",
    );
  },
});
Deno.test({
  name: "config_readBoolean_00",
  fn: async (ctx) => {
    for (const value of ["1", "t", "true", "y", "yes"]) {
      await ctx.step(`value: ${value}`, () => {
        const actualOptional = readOptionalBoolean({ value }, "value");
        const actualRequired = readRequiredBoolean({ value }, "value");
        assertEquals(
          { actualOptional, actualRequired },
          { actualOptional: true, actualRequired: true },
        );
      });
    }
  },
});
Deno.test({
  name: "config_readBoolean_01",
  fn: async (ctx) => {
    for (const value of ["0", "f", "false", "n", "no", "", "anything"]) {
      await ctx.step(`value: ${value}`, () => {
        const actualOptional = readOptionalBoolean({ value }, "value");
        const actualRequired = readRequiredBoolean({ value }, "value");
        assertEquals(
          { actualOptional, actualRequired },
          { actualOptional: false, actualRequired: false },
        );
      });
    }
  },
});
Deno.test({
  name: "config_readBoolean_02",
  fn: () => {
    const actual = readOptionalBoolean({}, "value");
    assertEquals(actual, undefined);
  },
});
Deno.test({
  name: "config_readBoolean_03",
  fn: () => {
    assertThrows(
      () => readRequiredBoolean({}, "value"),
      ConfigError,
      "Invalid configuration. Key [value] is required.",
      "readRequiredBoolean is expected to throw but isn't",
    );
  },
});
