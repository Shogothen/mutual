import type { RoleModel, RolePreference } from "../questions/types";

/**
 * Role compatibility.
 *
 * Cards declare a role model; people declare a role preference. Two answers
 * are role-compatible when the pair of preferences can produce a working
 * constellation for that role model.
 *
 * Rules (docs/MATCHING_ENGINE.md, §11 spec):
 * - symmetric / not_relevant cards ignore roles entirely.
 * - directional cards need one initiating side and one receiving side.
 *   "switching" and "both" can fill either side. Two people who *only*
 *   initiate (or only receive) are not a functional match.
 * - observer cards need one observing side and one side that is seen
 *   (modelled as "receiving"). "switching"/"both" can fill either side.
 * - switchable cards accept any combination except a hard directional clash.
 */

const FLEXIBLE: readonly RolePreference[] = ["switching", "both"];

function isFlexible(r: RolePreference): boolean {
  return FLEXIBLE.includes(r);
}

/** Explicit matrix for directional cards: can (a, b) fill (initiating, receiving)? */
function coversDirectional(a: RolePreference, b: RolePreference): boolean {
  const canInitiate = (r: RolePreference) => r === "initiating" || isFlexible(r);
  const canReceive = (r: RolePreference) => r === "receiving" || isFlexible(r);
  return (canInitiate(a) && canReceive(b)) || (canInitiate(b) && canReceive(a));
}

function coversObserver(a: RolePreference, b: RolePreference): boolean {
  const canObserve = (r: RolePreference) => r === "observing" || isFlexible(r);
  const canBeSeen = (r: RolePreference) => r === "receiving" || isFlexible(r);
  return (canObserve(a) && canBeSeen(b)) || (canObserve(b) && canBeSeen(a));
}

export function rolesCompatible(model: RoleModel, a: RolePreference, b: RolePreference): boolean {
  switch (model) {
    case "symmetric":
    case "not_relevant":
      return true;
    case "directional":
      return coversDirectional(a, b);
    case "observer":
      return coversObserver(a, b);
    case "switchable": {
      // Any pairing works as long as it is not two rigid identical directions.
      const rigidSame = a === b && (a === "initiating" || a === "receiving" || a === "observing");
      return !rigidSame;
    }
  }
}
