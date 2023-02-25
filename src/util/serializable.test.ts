import { assertEquals } from "../../deps/std.ts";
import { Serializable, toSerializable } from "./serializable.ts";

const a = {
  a: undefined as unknown,
  b: undefined as unknown,
  c: undefined as unknown,
};
const b = { a, b: undefined as unknown, c: undefined as unknown };
const c = { a, b, c: undefined as unknown };
a.a = a;
a.b = b;
a.c = c;
b.b = b;
b.c = c;
c.c = c;

const d = new Date();
const e = new Error("test 0");
const cases: [unknown, Serializable][] = [
  [null, null],
  [undefined, undefined],
  [[], []],
  [1, 1],
  [true, true],
  [false, false],
  ["abc", "abc"],
  [Symbol(), undefined],
  [Number.NaN, null],
  [d, d.toISOString()],
  [e, {
    name: "Error",
    message: "test 0",
    stack: e.stack,
  }],
  [new Map([["a", 1], ["b", 2]]), { a: 1, b: 2 }],
  [new Set([1, 2, 3]), [1, 2, 3]],
  [a, {
    a: { _ref: 0 },
    b: {
      a: { _ref: 0 },
      b: { _ref: 1 },
      c: {
        a: { _ref: 0 },
        b: { _ref: 1 },
        c: { _ref: 2 },
      },
    },
    c: { _ref: 2 },
  }],
  [b, {
    a: {
      a: { _ref: 1 },
      b: { _ref: 0 },
      c: {
        a: { _ref: 1 },
        b: { _ref: 0 },
        c: { _ref: 2 },
      },
    },
    b: { _ref: 0 },
    c: { _ref: 2 },
  }],
  [c, {
    a: {
      a: { _ref: 1 },
      b: {
        a: { _ref: 1 },
        b: { _ref: 2 },
        c: { _ref: 0 },
      },
      c: { _ref: 0 },
    },
    b: { _ref: 2 },
    c: { _ref: 0 },
  }],
];

Deno.test({
  name: "serializable",
  fn: async (t) => {
    let i = 0;
    for (const [value, expected] of cases) {
      const n = (i++).toString().padStart(2, "0");
      await t.step({
        name: `to_${n}`,
        fn: () => {
          const actual = toSerializable(value);
          assertEquals(actual, expected);
        },
      });
    }
  },
});
