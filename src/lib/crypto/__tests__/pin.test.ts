import { describe, expect, it } from "vitest";
import { hashPin, verifyPin } from "../pin";

describe("pin hashing", () => {
  it("verifies a correct pin and rejects a wrong one", async () => {
    const record = await hashPin("1234");
    expect(await verifyPin("1234", record)).toBe(true);
    expect(await verifyPin("4321", record)).toBe(false);
  });

  it("uses a unique salt per record", async () => {
    const a = await hashPin("1234");
    const b = await hashPin("1234");
    expect([...a.salt]).not.toEqual([...b.salt]);
    expect([...new Uint8Array(a.hash)]).not.toEqual([...new Uint8Array(b.hash)]);
  });
});
