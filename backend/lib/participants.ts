import { connect, Participant } from "lib/db.js";
import type { Participant as ParticipantT, Profile, ParticipantListMode, TripLifelistMode } from "@birdplan/shared";

export async function isTripEditor(tripId: string, uid?: string | null): Promise<boolean> {
  if (!uid) return false;
  await connect();
  return !!(await Participant.exists({ tripId, uid, status: "active" }));
}

export function computeIntersection(lists: string[][]): string[] {
  if (lists.length === 0) return [];
  const [first, ...rest] = lists;
  const sets = rest.map((list) => new Set(list));
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

export function participantEffectiveList(p: LeanParticipant, profilesByUid: Map<string, Profile>): string[] {
  if (!p.uid) return p.lifelist || [];
  const profile = profilesByUid.get(p.uid);
  const base = p.listMode === "custom" ? p.lifelist || [] : profile?.lifelist || [];
  const exceptions = profile?.exceptions;
  if (!exceptions?.length) return base;
  const ex = new Set(exceptions);
  return base.filter((code) => !ex.has(code));
}

export type ResolvedTripLifelist = {
  mode: TripLifelistMode;
  groupLifelist: string[] | null;
  groupUpdatedAt: Date | null;
  viewerLifelist: string[] | null;
  viewer: { participantId: string; listMode: ParticipantListMode } | null;
};

export function resolveTripLifelist(
  activeParticipants: ParticipantT[],
  profilesByUid: Map<string, Profile>,
  viewerUid?: string | null
): ResolvedTripLifelist {
  const viewerP = viewerUid ? activeParticipants.find((p) => p.uid === viewerUid) : null;
  const viewer = viewerP ? { participantId: viewerP._id, listMode: viewerP.listMode } : null;
  const viewerLifelist = viewerP ? participantEffectiveList(viewerP, profilesByUid) : null;

  if (activeParticipants.length <= 1) {
    const only = activeParticipants[0];
    if (!only || (only.uid && only.listMode === "world")) {
      return { mode: "world", groupLifelist: null, groupUpdatedAt: null, viewerLifelist, viewer };
    }
    return {
      mode: "customSingle",
      groupLifelist: participantEffectiveList(only, profilesByUid),
      groupUpdatedAt: only.lifelistUpdatedAt ?? null,
      viewerLifelist,
      viewer,
    };
  }

  const lists = activeParticipants
    .map((p) => participantEffectiveList(p, profilesByUid))
    .filter((list) => list.length > 0);

  return {
    mode: "customShared",
    groupLifelist: computeIntersection(lists),
    groupUpdatedAt: null,
    viewerLifelist,
    viewer,
  };
}
