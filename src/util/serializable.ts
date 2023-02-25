import { isReference, Type, type } from "./type.ts";

export type Serializable =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | { toJson: () => string }
  | { toString(): () => string }
  | ISerializable
  | Array<Serializable>;

export interface ISerializable {
  [key: string]: Serializable;
}

export function toSerializable(value: unknown): Serializable {
  let i = 0;
  const instances = new Map<unknown, number>();
  const resolve = (value: unknown): Serializable => {
    const t = type(value);
    if (isReference(value)) {
      if (instances.has(value)) {
        return { _ref: instances.get(value) };
      } else {
        instances.set(value, i++);
      }
    }

    const record = (entries: [string, unknown][]) =>
      entries
        .map<Record<string, Serializable>>(([k, v]) => ({ [k]: resolve(v) }))
        .reduce<Record<string, Serializable>>(
          (a, b) => Object.assign(a, b),
          {},
        );

    switch (t) {
      case Type.Array:
        return (<[]> value).map((v) => resolve(v));
      case Type.Boolean:
        return <boolean> value;
      case Type.Date:
        return (<Date> value).toISOString();
      case Type.Error: {
        const { name, message, cause, stack, ...rest } = <Error> value;
        return {
          name,
          message,
          ...record(Object.entries(rest)),
          stack,
          ...Object.getOwnPropertyDescriptor(value, "cause")
            ? { cause: resolve(cause) }
            : {},
        };
      }
      case Type.Map:
        return record([...<Map<string, unknown>> value]);
      case Type.NaN:
        return null;
      case Type.Null:
        return null;
      case Type.Number:
        return <number> value;
      case Type.Record:
        return record(
          Object.entries(<Record<string | number | symbol, unknown>> value),
        );
      case Type.Set:
        return [...<Set<unknown>> value].map((v) => resolve(v));
      case Type.String:
        return <string> value;
      case Type.Symbol:
        return undefined;
      case Type.Undefined:
        return undefined;
    }
  };
  return resolve(value);
}
