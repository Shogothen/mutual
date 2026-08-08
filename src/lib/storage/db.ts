import { openDB, type IDBPDatabase } from "idb";
import { decryptJson, encryptJson, generateLocalKey, type EncryptedBlob } from "../crypto/aes";
import type { PinRecord } from "../crypto/pin";

/**
 * IndexedDB layout:
 * - "keys":            device-local CryptoKey + PIN verifier (never raw secrets)
 * - "pending_answers": AES-GCM-encrypted offline answer queue
 *
 * localStorage is ONLY used for non-sensitive preferences (see prefs.ts).
 */

const DB_NAME = "mutual-local";
const DB_VERSION = 1;

type PendingAnswerPayload = {
  questionId: string;
  answer: unknown;
  answerVersion: number;
  queuedAt: string;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      database.createObjectStore("keys");
      database.createObjectStore("pending_answers");
    }
  });
  return dbPromise;
}

async function localKey(): Promise<CryptoKey> {
  const d = await db();
  const existing = (await d.get("keys", "device-key")) as CryptoKey | undefined;
  if (existing) return existing;
  const key = await generateLocalKey();
  await d.put("keys", key, "device-key");
  return key;
}

export async function queueAnswer(questionId: string, payload: PendingAnswerPayload): Promise<void> {
  const key = await localKey();
  const blob = await encryptJson(key, payload);
  await (await db()).put("pending_answers", blob, questionId);
}

export async function readQueuedAnswers(): Promise<PendingAnswerPayload[]> {
  const d = await db();
  const key = await localKey();
  const keys = await d.getAllKeys("pending_answers");
  const out: PendingAnswerPayload[] = [];
  for (const k of keys) {
    const blob = (await d.get("pending_answers", k)) as EncryptedBlob;
    out.push(await decryptJson<PendingAnswerPayload>(key, blob));
  }
  return out;
}

export async function removeQueuedAnswer(questionId: string): Promise<void> {
  await (await db()).delete("pending_answers", questionId);
}

export async function clearAllLocalData(): Promise<void> {
  const d = await db();
  await d.clear("pending_answers");
  await d.clear("keys");
}

export async function savePinRecord(record: PinRecord): Promise<void> {
  await (await db()).put("keys", record, "pin");
}

export async function loadPinRecord(): Promise<PinRecord | null> {
  return ((await (await db()).get("keys", "pin")) as PinRecord | undefined) ?? null;
}

export async function clearPinRecord(): Promise<void> {
  await (await db()).delete("keys", "pin");
}
