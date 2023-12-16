import React from "react";
import { useUser } from "providers/user";
import { Profile } from "lib/types";
import { subscribeToProfile, setProfileValue } from "lib/firebase";

interface ContextT extends Profile {
  setLifelist: (lifelist: string[]) => Promise<void>;
  addToLifeList: (code: string) => Promise<void>;
  setCountryLifelist: (lifelist: string[]) => Promise<void>;
  setRadius: (radius: number) => Promise<void>;
  setLat: (lat: number) => Promise<void>;
  setLng: (lng: number) => Promise<void>;
  reset: () => void;
}

const initialState: Profile = {
  id: "",
  lifelist: [],
  countryLifelist: [],
  radius: 50,
  lat: undefined,
  lng: undefined,
  enableExperimental: false,
};

export const ProfileContext = React.createContext<ContextT>({
  ...initialState,
  setLifelist: async () => {},
  addToLifeList: async () => {},
  setCountryLifelist: async () => {},
  setRadius: async () => {},
  setLat: async () => {},
  setLng: async () => {},
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

  const addToLifeList = async (code: string) => {
    setState((state) => ({ ...state, lifelist: [...state.lifelist, code] }));
    await setProfileValue("lifelist", [...state.lifelist, code]);
  };

  const setCountryLifelist = async (countryLifelist: string[]) => {
    setState((state) => ({ ...state, countryLifelist }));
    await setProfileValue("countryLifelist", countryLifelist);
  };

  const setRadius = async (radius: number) => {
    setState((state) => ({ ...state, radius }));
    await setProfileValue("radius", radius);
  };

  const setLat = async (lat: number) => {
    setState((state) => ({ ...state, lat }));
    await setProfileValue("lat", lat);
  };

  const setLng = async (lng: number) => {
    setState((state) => ({ ...state, lng }));
    await setProfileValue("lng", lng);
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
        lat: state.lat,
        lng: state.lng,
        setLat,
        setLng,
        setLifelist,
        addToLifeList,
        setCountryLifelist,
        setRadius,
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
