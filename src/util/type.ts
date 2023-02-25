export enum Type {
  Null = "null",
  Undefined = "undefined",
  NaN = "nan",
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Record = "record",
  Array = "array",
  Date = "date",
  Error = "error",
  Map = "map",
  Set = "set",
  Symbol = "symbol",
}

export function isReference(value: unknown) {
  const t = type(value);
  switch (t) {
    case Type.Record:
    case Type.Array:
    case Type.Map:
    case Type.Set:
    case Type.Error:
      return true;
    default:
      return false;
  }
}

export function type(value: unknown) {
  if (value === null) {
    return Type.Null;
  } else if (value === undefined) {
    return Type.Undefined;
  } else {
    switch (typeof value) {
      case "boolean":
        return Type.Boolean;
      case "string":
        return Type.String;
      case "symbol":
        return Type.Symbol;
      case "number":
        return isNaN(value) ? Type.NaN : Type.Number;
      default: {
        if (Array.isArray(value)) {
          return Type.Array;
        } else if (value instanceof Date) {
          return Type.Date;
        } else if (value instanceof Error) {
          return Type.Error;
        } else if (value instanceof Map) {
          return Type.Map;
        } else if (value instanceof Set) {
          return Type.Set;
        } else {
          return Type.Record;
        }
      }
    }
  }
}
