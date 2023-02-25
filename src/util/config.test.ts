import { assertEquals, assertThrows } from "../../deps/std.ts";
import { ConfigError } from "../errors/config.error.ts";
import { readInt, readRequiredString, readString } from "./config.ts";

Deno.test({
  name: "config_readString_00",
  fn: () => {
    const actual = readString({ a: "abc" }, "a");
    assertEquals(actual, "abc");
  },
});
Deno.test({
  name: "config_readString_01",
  fn: () => {
    const actual = readString({ a: "abc" }, "b", "xyz");
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
    const actual = readInt({ a: "1" }, "a", 0);
    assertEquals(actual, 1);
  },
});
Deno.test({
  name: "config_readInt_01",
  fn: () => {
    const actual = readInt({ a: "1" }, "b", 7);
    assertEquals(actual, 7);
  },
});
Deno.test({
  name: "config_readInt_02",
  fn: () => {
    assertThrows(
      () => readInt({ a: "xyz" }, "a", 0),
      ConfigError,
      "Invalid configuration. Key [a] (xyz) is not an integer.",
      "readInt is expected to throw but isn't",
    );
  },
});
