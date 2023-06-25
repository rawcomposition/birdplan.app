import React from "react";
import { useUser } from "providers/user";
import { Address, Profile } from "lib/types";
import { subscribeToProfile, setProfileValue, appendProfileLifelist, removeProfileLifelist } from "lib/firebase";

interface ContextT extends Profile {
  setLifelist: (lifelist: string[]) => Promise<void>;
  setCountryLifelist: (lifelist: string[]) => Promise<void>;
  setRadius: (radius: number) => Promise<void>;
  setAddress: (address: Address) => Promise<void>;
  reset: () => void;
}

const initialState: Profile = {
  id: "",
  lifelist: [],
  countryLifelist: [],
  radius: 50,
  address: undefined,
  enableExperimental: false,
};

export const ProfileContext = React.createContext<ContextT>({
  ...initialState,
  setLifelist: async () => {},
  setCountryLifelist: async () => {},
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
    const unsubscribe = subscribeToProfile((profile) => setState(profile));
    return () => unsubscribe();
  }, [uid]);

  const setLifelist = async (lifelist: string[]) => {
    setState((state) => ({ ...state, lifelist }));
    await setProfileValue("lifelist", lifelist);
  };

  const setCountryLifelist = async (countryLifelist: string[]) => {
    setState((state) => ({ ...state, countryLifelist }));
    await setProfileValue("countryLifelist", countryLifelist);
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
        id: state.id,
        enableExperimental: state.enableExperimental,
        lifelist: state.lifelist || [],
        countryLifelist: state.countryLifelist || [],
        radius: state.radius || 50,
        address: state.address,
        setLifelist,
        setCountryLifelist,
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
