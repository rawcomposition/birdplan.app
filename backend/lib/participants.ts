import { connect, Participant } from "lib/db.js";
import type { Participant as ParticipantT, Profile, ParticipantListMode, TripLifelistMode } from "@birdplan/shared";

/**
 * Is `uid` an active member of this trip? Replaces the old `trip.userIds.includes(uid)` check —
 * membership now lives entirely in the Participant collection (the single source of truth).
 */
export async function isTripEditor(tripId: string, uid?: string | null): Promise<boolean> {
  if (!uid) return false;
  await connect();
  return !!(await Participant.exists({ tripId, uid, status: "active" }));
}

// The intersection of every list: a species counts as "seen" by the group only when it appears
// in all of them. Empty input ⇒ empty list.
export function computeIntersection(lists: string[][]): string[] {
  if (lists.length === 0) return [];
  const [first, ...rest] = lists;
  const sets = rest.map((codes) => new Set(codes));
  const seen = new Set<string>();
  const result: string[] = [];
  for (const code of first) {
    if (seen.has(code)) continue;
    seen.add(code);
    if (sets.every((set) => set.has(code))) result.push(code);
  }
  return result;
}

type LeanParticipant = Pick<ParticipantT, "_id" | "uid" | "listMode" | "lifelist" | "lifelistUpdatedAt">;

/**
 * The effective list a single participant contributes:
 *  - registered user, World mode → their live Profile.lifelist
 *  - registered user, Custom mode → their per-trip uploaded list
 *  - named-only → their uploaded list (no exceptions)
 * A registered user's own Profile.exceptions ("want to see again") are subtracted in both modes.
 */
export function participantEffectiveList(p: LeanParticipant, profilesByUid: Map<string, Profile>): string[] {
  if (!p.uid) return p.lifelist || []; // named-only
  const profile = profilesByUid.get(p.uid);
  const base = p.listMode === "custom" ? p.lifelist || [] : profile?.lifelist || [];
  const exceptions = profile?.exceptions;
  if (!exceptions?.length) return base;
  const ex = new Set(exceptions);
  return base.filter((code) => !ex.has(code));
}

export type ResolvedTripLifelist = {
  mode: TripLifelistMode;
  groupCodes: string[] | null; // null ⇒ solo-World; client falls back to the viewer's live global list
  groupUpdatedAt: Date | null;
  viewerCodes: string[] | null; // the requester's own effective list (null if not a participant)
  viewer: { participantId: string; listMode: ParticipantListMode } | null;
};

/**
 * Resolve a trip's target list from its active roster, at read time. The group list is the
 * intersection of every participant's effective list; the viewer's own list is returned
 * separately so other participants' lists never cross the wire.
 */
export function resolveTripLifelist(
  activeParticipants: ParticipantT[],
  profilesByUid: Map<string, Profile>,
  viewerUid?: string | null
): ResolvedTripLifelist {
  const viewerP = viewerUid ? activeParticipants.find((p) => p.uid === viewerUid) : null;
  const viewer = viewerP ? { participantId: viewerP._id, listMode: viewerP.listMode } : null;
  const viewerCodes = viewerP ? participantEffectiveList(viewerP, profilesByUid) : null;

  // A solo World user (or an empty roster) targets against the live global list — return null so
  // the client uses the viewer's own Profile, identical to the pre-participants behaviour.
  if (activeParticipants.length <= 1) {
    const only = activeParticipants[0];
    if (!only || (only.uid && only.listMode === "world")) {
      return { mode: "world", groupCodes: null, groupUpdatedAt: null, viewerCodes, viewer };
    }
    return {
      mode: "customSingle",
      groupCodes: participantEffectiveList(only, profilesByUid),
      groupUpdatedAt: only.lifelistUpdatedAt ?? null,
      viewerCodes,
      viewer,
    };
  }

  // A participant who hasn't provided a list yet (empty — e.g. a World user who hasn't imported)
  // is left OUT of the intersection rather than collapsing the whole group's targets to empty.
  const lists = activeParticipants
    .map((p) => participantEffectiveList(p, profilesByUid))
    .filter((codes) => codes.length > 0);

  return {
    mode: "customShared",
    groupCodes: computeIntersection(lists),
    groupUpdatedAt: null,
    viewerCodes,
    viewer,
  };
}
