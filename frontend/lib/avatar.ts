import type { ParticipantView, User } from "@birdplan/shared";

export type AvatarUser = {
  seed: string;
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
};

export function avatarFromUser(user: Pick<User, "_id" | "name" | "email" | "photoUrl">): AvatarUser {
  return {
    seed: user._id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
  };
}

export function avatarFromParticipant(p: ParticipantView): AvatarUser {
  return {
    seed: p.userId || p._id,
    name: p.name,
    email: p.email,
    photoUrl: p.photoUrl,
  };
}
