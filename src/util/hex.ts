export function hexToUint8(hexString: string): Uint8Array {
  return new Uint8Array(
    hexString.match(/[\dA-F]{2}/gi)!.map((byte) => parseInt(byte, 16)),
  );
}
