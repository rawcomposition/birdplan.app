import React from "react";
import { Profile } from "lib/types";
import { subscribeToProfiles } from "lib/firebase";

export default function useProfiles(ids?: string[]) {
  const [loading, setLoading] = React.useState(true);
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const idsString = ids?.join(",");

  React.useEffect(() => {
    if (!idsString) return;
    const unsubscribe = subscribeToProfiles(idsString.split(","), (profiles) => {
      setProfiles(profiles);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [idsString]);

  return { profiles, loading };
}
