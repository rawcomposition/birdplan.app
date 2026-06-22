import type { ParticipantView, Profile } from "@birdplan/shared";

export type AvatarUser = {
  seed: string;
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
};

export function avatarFromProfile(profile: Pick<Profile, "uid" | "name" | "email" | "photoUrl">): AvatarUser {
  return {
    seed: profile.uid,
    name: profile.name,
    email: profile.email,
    photoUrl: profile.photoUrl,
  };
}

export function avatarFromParticipant(p: ParticipantView): AvatarUser {
  return {
    seed: p.uid || p._id,
    name: p.name,
    email: p.email,
    photoUrl: p.photoUrl,
  };
}
