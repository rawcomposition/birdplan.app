import { useQuery } from "@tanstack/react-query";
import { Profile } from "@birdplan/shared";
import { useSessionToken } from "lib/sessionToken";

export const useProfile = (): Profile => {
  const token = useSessionToken();

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/auth/me"],
    enabled: !!token,
  });

  const lifelist = profile?.lifelist?.filter((it) => !profile?.exceptions?.includes(it)) || [];

  return {
    _id: profile?._id || "",
    uid: profile?.uid || "",
    email: profile?.email || "",
    photoUrl: profile?.photoUrl || "",
    lifelist,
    lifelistUpdatedAt: profile?.lifelistUpdatedAt || null,
    exceptions: profile?.exceptions || [],
    dismissedNoticeId: profile?.dismissedNoticeId,
    lastActiveAt: profile?.lastActiveAt || new Date(),
    name: profile?.name || "",
    isAdmin: profile?.isAdmin || false,
  };
};
