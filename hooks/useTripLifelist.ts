import React from "react";
import { useProfile } from "providers/profile";
import { subscribeToProfile } from "lib/firebase";

type Props = {
  tripUid?: string;
  isShared: boolean;
};

export default function useTripLifelist({ tripUid, isShared }: Props) {
  const { lifelist: profileLifelist } = useProfile();
  const [tripLifelist, setTripLifelist] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!isShared || !tripUid) return;
    const unsubscribe = subscribeToProfile(tripUid, (profile) => setTripLifelist(profile.lifelist));
    return () => unsubscribe();
  }, [isShared, tripUid]);

  const lifelist = isShared ? tripLifelist : profileLifelist;

  return { lifelist };
}
