import { connect, Participant, User as UserModel } from "lib/db.js";
import type { Participant as ParticipantT, User, ParticipantListMode } from "@birdplan/shared";

export async function isTripEditor(tripId: string, userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  await connect();
  return !!(await Participant.exists({ tripId, userId, status: "active" }));
}

export function isEditorInRoster(roster: Pick<ParticipantT, "userId" | "status">[], userId?: string | null): boolean {
  if (!userId) return false;
  return roster.some((p) => p.userId === userId && p.status === "active");
}

export async function loadActiveRoster(tripId: string): Promise<ParticipantT[]> {
  await connect();
  return (await Participant.find({ tripId, status: "active" }).lean()) as unknown as ParticipantT[];
}

export async function loadUsersById(roster: Pick<ParticipantT, "userId">[]): Promise<Map<string, User>> {
  const userIds = roster.map((p) => p.userId).filter((u): u is string => !!u);
  const users = userIds.length ? await UserModel.find({ _id: { $in: userIds } }).lean() : [];
  return new Map(users.map((u) => [u._id, u as unknown as User] as const));
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

export function computeUnion(lists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const list of lists) {
    for (const code of list) {
      if (seen.has(code)) continue;
      seen.add(code);
      result.push(code);
    }
  }
  return result;
}

type LeanParticipant = Pick<ParticipantT, "_id" | "userId" | "listMode" | "lifelist" | "lifelistUpdatedAt">;

export function participantEffectiveList(p: LeanParticipant, usersById: Map<string, User>): string[] {
  if (!p.userId) return p.lifelist || [];
  const user = usersById.get(p.userId);
  const base = p.listMode === "custom" ? p.lifelist || [] : user?.lifelist || [];
  const exceptions = user?.exceptions;
  if (!exceptions?.length) return base;
  const ex = new Set(exceptions);
  return base.filter((code) => !ex.has(code));
}

export type ResolvedTripLifelist = {
  isGroup: boolean;
  groupLifelist: string[] | null;
  unionLifelist: string[] | null;
  tripLifelist: string[] | null;
  viewerLifelist: string[] | null;
  viewer: { participantId: string; listMode: ParticipantListMode; listUpdatedAt: Date | null } | null;
};

export function resolveTripLifelist(
  activeParticipants: ParticipantT[],
  usersById: Map<string, User>,
  viewerUserId?: string | null
): ResolvedTripLifelist {
  const viewerP = viewerUserId ? activeParticipants.find((p) => p.userId === viewerUserId) : null;
  const viewer = viewerP
    ? { participantId: viewerP._id, listMode: viewerP.listMode, listUpdatedAt: viewerP.lifelistUpdatedAt ?? null }
    : null;
  const viewerLifelist = viewerP ? participantEffectiveList(viewerP, usersById) : null;
  const isPublicViewer = !viewerP;

  if (activeParticipants.length <= 1) {
    const owner = activeParticipants[0];
    const tripLifelist = isPublicViewer && owner ? participantEffectiveList(owner, usersById) : null;
    return { isGroup: false, groupLifelist: null, unionLifelist: null, tripLifelist, viewerLifelist, viewer };
  }

  const lists = activeParticipants
    .map((p) => participantEffectiveList(p, usersById))
    .filter((list) => list.length > 0);
  const groupLifelist = computeIntersection(lists);
  const unionLifelist = computeUnion(lists);

  return {
    isGroup: true,
    groupLifelist,
    unionLifelist,
    tripLifelist: isPublicViewer ? groupLifelist : null,
    viewerLifelist,
    viewer,
  };
}
