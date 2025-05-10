/**
 * This module provides a utility function to convert a hex string to a Uint8Array.
 * @module
 */

/**
 * Converts a hex string to a Uint8Array.
 * @param hexString The hex string to convert.
 * @returns The Uint8Array representation of the hex string.
 */
export function hexToUint8(hexString: string): Uint8Array {
  return new Uint8Array(
    hexString.match(/[\dA-F]{2}/gi)!.map((byte) => parseInt(byte, 16)),
  );
}
