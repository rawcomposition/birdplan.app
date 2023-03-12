import * as React from "react";
import Sidebar from "components/sidebar";
import SpeciesList from "components/SpeciesList";
import Skeleton from "components/Skeleton";
import { reducer, initialState } from "../reducer";
import { saveSeenSpecies } from "lib/firebase";
import useSyncLocalhost from "hooks/useSyncLocalStorage";
import LocationSelect from "components/LocationSelect";
import useFetchSpecies from "hooks/useFetchSpecies";
import WelcomeMessage from "components/WelcomeMessage";
import SidebarToggle from "components/SidebarToggle";
import NoResults from "components/NoResults";
import FetchError from "components/FetchError";
import ResultsInfo from "components/ResultsInfo";
import MainContent from "components/MainContent";
import usePostProcessSpecies from "hooks/usePostProcessSpecies";
import Head from "next/head";
import useFetchSeenSpecies from "hooks/useFetchSeenSpecies";
import { Address } from "lib/types";

export default function Home() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { address, radius, species, expanded, seen, pending, showSeen, isCacheRestored, showSidebar } = state;
  const { lat, lng } = address || {};

  useSyncLocalhost({ dispatch, seen, showSeen, address, radius });

  useFetchSeenSpecies({ dispatch });

  const { loading, error, lastUpdate, call } = useFetchSpecies({
    lat: lat || null,
    lng: lng || null,
    radius,
    onCallback: (response) => {
      dispatch({ type: "set_species", payload: response });
    },
  });

  React.useEffect(() => {
    if (lat && lng) {
      call();
    }
  }, [lat, lng, radius, call]);

  const handleToggleExpand = (code: string) => {
    dispatch({ type: "expand_toggle", payload: code });
  };

  const addSeenSpecies = (code: string) => {
    if (showSeen) {
      dispatch({ type: "add_seen", payload: code });
    } else {
      dispatch({ type: "add_pending", payload: code });
      setTimeout(() => {
        dispatch({ type: "add_seen", payload: code });
      }, 1300);
    }
    saveSeenSpecies([...seen, code]);
  };

  const removeSeenSpecies = (code: string) => {
    dispatch({ type: "remove_seen", payload: code });
    saveSeenSpecies(seen.filter((value) => value !== code));
  };

  const handleAddressChange = React.useCallback((value: Address) => {
    dispatch({ type: "set_address", payload: value });
  }, []);

  const handleFilterChange = (field: string, value: any) => {
    dispatch({ type: "filter_change", payload: { field, value } });
  };

  const { seenCount, filteredSpecies } = usePostProcessSpecies({ species, expanded, seen, pending, showSeen });

  const showWelcome = (!lat || !lng) && isCacheRestored;
  const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && !error;

  return (
    <div className="flex h-screen">
      <Head>
        <title>BirdyAlert.com - Find rare birds near you</title>
      </Head>

      <Sidebar
        seenCount={seenCount}
        filters={{ showSeen, radius }}
        open={showSidebar}
        onFilterChange={handleFilterChange}
        onLogout={() => dispatch({ type: "reset" })}
      />

      <MainContent
        shouldRender={isCacheRestored}
        onClick={showSidebar ? () => dispatch({ type: "toggle_sidebar" }) : null}
      >
        {showWelcome && <WelcomeMessage />}

        <div className="flex mb-4">
          <LocationSelect className="w-full mt-6" value={address} onChange={handleAddressChange} />
          <SidebarToggle onClick={() => dispatch({ type: "toggle_sidebar" })} />
        </div>

        {error && <FetchError reload={call} />}

        {loading && <Skeleton count={3} />}

        {showNoResults && <NoResults reload={call} />}

        {lat && lng && !!filteredSpecies?.length && (
          <SpeciesList
            items={filteredSpecies}
            onToggleExpand={handleToggleExpand}
            onAddSeen={addSeenSpecies}
            onRemoveSeen={removeSeenSpecies}
            lat={lat}
            lng={lng}
          />
        )}

        {!!filteredSpecies?.length && (
          <ResultsInfo
            count={filteredSpecies.length}
            total={species?.length || 0}
            onReload={call}
            lastUpdate={lastUpdate?.toString()}
          />
        )}
      </MainContent>
    </div>
  );
}
