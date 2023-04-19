import React from "react";
import { useUser } from "providers/user";
import { Address, Profile } from "lib/types";
import { subscribeToProfile, setProfileValue, appendProfileLifelist, removeProfileLifelist } from "lib/firebase";

interface ContextT extends Profile {
  setLifelist: (lifelist: string[]) => Promise<void>;
  appendLifelist: (speciesCode: string) => Promise<void>;
  removeLifelist: (speciesCode: string) => Promise<void>;
  setRadius: (radius: number) => Promise<void>;
  setAddress: (address: Address) => Promise<void>;
  reset: () => void;
}

const initialState: Profile = {
  lifelist: [],
  radius: 50,
  address: undefined,
};

export const ProfileContext = React.createContext<ContextT>({
  ...initialState,
  setLifelist: async () => {},
  appendLifelist: async () => {},
  removeLifelist: async () => {},
  setRadius: async () => {},
  setAddress: async () => {},
  reset: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ProfileProvider = ({ children }: Props) => {
  const [state, setState] = React.useState<Profile>(initialState);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToProfile(uid, (profile) => setState(profile));
    return () => unsubscribe();
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

  const reset = () => {
    setState(initialState);
  };

  return (
    <ProfileContext.Provider
      value={{
        lifelist: state.lifelist || [],
        radius: state.radius || 50,
        address: state.address,
        setLifelist,
        appendLifelist,
        removeLifelist,
        setRadius,
        setAddress,
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
