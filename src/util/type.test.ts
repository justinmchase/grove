import { assertEquals } from "../../deps/std.ts";
import { isReference, Type, type } from "./type.ts";

const cases = [
  [null, Type.Null, false],
  [undefined, Type.Undefined, false],
  [true, Type.Boolean, false],
  [false, Type.Boolean, false],
  ["", Type.String, false],
  [Symbol(), Type.Symbol, false],
  [Number.EPSILON, Type.Number, false],
  [Number.NaN, Type.NaN, false],
  [[], Type.Array, true],
  [new Date(), Type.Date, false],
  [new Error(), Type.Error, true],
  [new Set(), Type.Set, true],
  [new Map(), Type.Map, true],
  [{}, Type.Record, true],
];

Deno.test({
  name: "type",
  fn: async (t) => {
    let i = 0;
    for (const [value, expected] of cases) {
      const n = (i++).toString().padStart(2, "0");
      await t.step({
        name: `check_${n}`,
        fn: () => {
          const actual = type(value);
          assertEquals(actual, expected);
        },
      });
    }

    i = 0;
    for (const [value, , isRef] of cases) {
      const n = (i++).toString().padStart(2, "0");
      await t.step({
        name: `ref_${n}`,
        fn: () => {
          const actual = isReference(value);
          assertEquals(actual, isRef);
        },
      });
    }
  },
});
