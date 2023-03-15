import React from "react";
import { useUser } from "providers/user";
import { Address, Profile, Hotspot } from "lib/types";
import {
  fetchProfile,
  setProfileValue,
  appendProfileLifelist,
  removeProfileLifelist,
  updateProfileHotspots,
} from "lib/firebase";

interface ContextT extends Profile {
  setLifelist: (lifelist: string[]) => Promise<void>;
  appendLifelist: (speciesCode: string) => Promise<void>;
  removeLifelist: (speciesCode: string) => Promise<void>;
  setRadius: (radius: number) => Promise<void>;
  setAddress: (address: Address) => Promise<void>;
  appendHotspot: (hotspot: Hotspot) => Promise<void>;
  removeHotspot: (id: string) => Promise<void>;
  initialized: boolean;
}

const initialState: Profile = {
  lifelist: [],
  hotspots: [],
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
  appendHotspot: async () => {},
  removeHotspot: async () => {},
  initialized: false,
});

type Props = {
  children: React.ReactNode;
};

const ProfileProvider = ({ children }: Props) => {
  const [state, setState] = React.useState<Profile>(initialState);
  const [initialized, setInitialized] = React.useState(false);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (uid) {
      setInitialized(true);
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

  const appendHotspot = async (hotspot: Hotspot) => {
    const alreadyExists = state.hotspots.find((it) => it.id === hotspot.id);
    const newHotspots = alreadyExists ? state.hotspots : [...state.hotspots, hotspot];
    setState((state) => ({ ...state, hotspots: newHotspots }));
    await updateProfileHotspots(newHotspots);
  };

  const removeHotspot = async (id: string) => {
    const newHotspots = state.hotspots.filter((it) => it.id !== id);
    setState((state) => ({ ...state, hotspots: newHotspots }));
    await updateProfileHotspots(newHotspots);
  };

  return (
    <ProfileContext.Provider
      value={{
        lifelist: state.lifelist || [],
        radius: state.radius || 50,
        address: state.address,
        hotspots: state.hotspots || [],
        setLifelist,
        appendLifelist,
        removeLifelist,
        setRadius,
        setAddress,
        appendHotspot,
        removeHotspot,
        initialized,
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
