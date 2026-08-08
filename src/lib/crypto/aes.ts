/**
 * Local at-rest encryption for offline answers (AES-256-GCM via Web Crypto).
 *
 * Key management (docs/PRIVACY_ARCHITECTURE.md):
 * - A non-extractable AES key is generated per device on first use and stored
 *   as a CryptoKey object in IndexedDB. It never exists as raw bytes in JS
 *   after creation and is never sent anywhere.
 * - This protects offline queued answers against casual inspection of the
 *   browser storage (e.g. a partner opening DevTools). It does NOT protect
 *   against an attacker with full control of the same browser profile –
 *   that boundary is documented honestly in docs/THREAT_MODEL.md.
 */

const IV_LENGTH = 12;

export async function generateLocalKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt"
  ]);
}

export type EncryptedBlob = { iv: Uint8Array; data: ArrayBuffer };

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return { iv, data };
}

export async function decryptJson<T>(key: CryptoKey, blob: EncryptedBlob): Promise<T> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: blob.iv as BufferSource },
    key,
    blob.data
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}
