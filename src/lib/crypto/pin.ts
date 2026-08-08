/**
 * App-lock PIN handling. The PIN is never stored – only a PBKDF2-derived
 * verifier with a random salt. WebAuthn/biometrics are preferred where
 * available (see src/features/settings/AppLockSettings.tsx).
 */

const ITERATIONS = 310_000; // OWASP 2023+ recommendation for PBKDF2-SHA256
const KEY_BITS = 256;

export type PinRecord = { salt: Uint8Array; hash: ArrayBuffer; iterations: number };

async function derive(pin: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    material,
    KEY_BITS
  );
}

export async function hashPin(pin: string): Promise<PinRecord> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, salt, ITERATIONS);
  return { salt, hash, iterations: ITERATIONS };
}

export async function verifyPin(pin: string, record: PinRecord): Promise<boolean> {
  const candidate = await derive(pin, record.salt, record.iterations);
  const a = new Uint8Array(candidate);
  const b = new Uint8Array(record.hash);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}
