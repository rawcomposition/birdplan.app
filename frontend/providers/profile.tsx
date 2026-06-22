import React from "react";
import { useUser } from "providers/user";
import { Profile } from "@birdplan/shared";
import { useQuery } from "@tanstack/react-query";

interface ContextT extends Profile {}

const initialState: Profile = {
  _id: "",
  uid: "",
  name: "",
  email: "",
  photoUrl: "",
  lifelist: [],
  exceptions: [],
  dismissedNoticeId: "",
  lastActiveAt: new Date(),
};

export const ProfileContext = React.createContext<ContextT>({
  ...initialState,
});

type Props = {
  children: React.ReactNode;
};

const ProfileProvider = ({ children }: Props) => {
  const { user } = useUser();
  const uid = user?.uid;

  const { data: profile } = useQuery<Profile>({
    queryKey: [`/profile`],
    enabled: !!uid,
  });

  const lifelist = profile?.lifelist?.filter((it) => !profile?.exceptions?.includes(it)) || [];

  return (
    <ProfileContext.Provider
      value={{
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
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

const useProfile = () => {
  const state = React.useContext(ProfileContext);
  return { ...state };
};

export { ProfileProvider, useProfile };
