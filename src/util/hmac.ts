import { hexToUint8 } from "./hex.ts";

type HmacParams = {
  secret?: string;
  keyData?: BufferSource;
};

/**
 * Creates an hmac CryptoKey for signing and verifycation of hmac hashes.
 * @param params must contain either a secret string or the raw keyData
 * @returns A CryptoKey that can be used for signing and verifying HMAC hashes.
 */
export async function hmacCreateKey(params: HmacParams): Promise<CryptoKey> {
  const { secret } = params;
  const key = params.keyData ?? new TextEncoder().encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * Signs a value with the given key.
 * @param key The CryptoKey to use for signing.
 * @param value The value to sign.
 * @returns An ArrayBuffer containing the signature.
 */
export async function hmacSign(
  key: CryptoKey,
  value: string,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  return await crypto.subtle.sign(
    { name: "HMAC" },
    key,
    bytes,
  );
}

/**
 * Verifies a signature against the given data.
 * @param key The CryptoKey to use for verification.
 * @param hex The hex string representation of the signature.
 * @param data The data to verify against.
 * @returns True if the signature is valid, false otherwise.
 */
export async function hmacVerify(
  key: CryptoKey,
  hex: string,
  data: BufferSource,
): Promise<boolean> {
  const signature = hexToUint8(hex);
  return await crypto.subtle.verify(
    { name: "HMAC" },
    key,
    signature,
    data,
  );
}
