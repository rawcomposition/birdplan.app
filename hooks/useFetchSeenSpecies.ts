import * as React from "react";
import { useUser } from "providers/user";
import { fetchSeenSpecies } from "lib/firebase";
import { DispatchAction } from "lib/types";

type Props = {
  dispatch: React.Dispatch<DispatchAction>;
};

export default function useFetchSeenSpecies({ dispatch }: Props) {
  const { user } = useUser();
  React.useEffect(() => {
    const getData = async () => {
      const seen = await fetchSeenSpecies();
      if (seen.length) {
        dispatch({ type: "set_seen", payload: seen || [] });
      }
    };
    if (user?.uid) {
      getData();
    }
  }, [user?.uid, dispatch]);
}
