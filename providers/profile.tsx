import React from "react";
import { useUser } from "providers/user";
import { Profile } from "lib/types";
import { setProfileValue } from "lib/firebase";
import { useQuery } from "@tanstack/react-query";

interface ContextT extends Profile {
  reset: () => void;
}

const initialState: Profile = {
  _id: "",
  uid: "",
  lifelist: [],
  exceptions: [],
  dismissedNoticeId: "",
};

export const ProfileContext = React.createContext<ContextT>({
  ...initialState,
  reset: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ProfileProvider = ({ children }: Props) => {
  const { user } = useUser();
  const uid = user?.uid;

  const { data: profile } = useQuery<Profile>({
    queryKey: [`/api/my-profile`],
    enabled: !!uid,
  });

  const reset = () => {
    setState(initialState);
  };

  const lifelist = profile?.lifelist.filter((it) => !profile?.exceptions?.includes(it)) || [];

  return (
    <ProfileContext.Provider
      value={{
        _id: profile?._id || "",
        uid: profile?.uid || "",
        lifelist,
        exceptions: profile?.exceptions || [],
        dismissedNoticeId: profile?.dismissedNoticeId,
        reset,
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
