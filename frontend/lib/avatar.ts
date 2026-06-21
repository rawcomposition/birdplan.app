import type { User as FirebaseUser } from "firebase/auth";
import type { ParticipantView } from "@birdplan/shared";

export type AvatarUser = {
  seed: string;
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
};

export function avatarFromFirebaseUser(user: FirebaseUser): AvatarUser {
  return {
    seed: user.uid,
    name: user.displayName,
    email: user.email,
    photoUrl: user.photoURL,
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
