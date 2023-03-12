import React from "react";
import { Address, Profile } from "lib/types";
import { fetchProfile, setProfileValue, appendProfileLifelist, removeProfileLifelist } from "lib/firebase";
import { useUser } from "providers/user";

const initialState: Profile = {
  lifelist: [],
  radius: 50,
  address: undefined,
};

export default function useProfile() {
  const [state, setState] = React.useState<Profile>(initialState);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (uid) {
      fetchProfile().then((profile) => {
        if (profile) {
          setState((prev) => ({ ...prev, ...profile }));
        }
      });
    }
  }, [uid]);

  const setLifelist = async (lifelist: string[]) => {
    setState((state) => ({ ...state, lifelist }));
    await setProfileValue("lifelist", lifelist);
  };

  const appendLifelist = async (speciesCode: string) => {
    setState((state) => ({ ...state, lifelist: [...state.lifelist, speciesCode] }));
    await appendProfileLifelist(speciesCode);
  };

  const removeLifelist = async (speciesCode: string) => {
    setState((state) => ({ ...state, lifelist: state.lifelist.filter((code) => code !== speciesCode) }));
    await removeProfileLifelist(speciesCode);
  };

  const setRadius = async (radius: number) => {
    setState((state) => ({ ...state, radius }));
    await setProfileValue("radius", radius);
  };

  const setAddress = async (address: Address) => {
    setState((state) => ({ ...state, address }));
    await setProfileValue("address", address);
  };

  return {
    lifelist: state.lifelist || [],
    radius: state.radius || 50,
    address: state.address,
    setLifelist,
    appendLifelist,
    removeLifelist,
    setRadius,
    setAddress,
  };
}
