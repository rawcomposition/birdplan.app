import * as React from "react";
import Sidebar from "../components/sidebar";
import SpeciesList from "../components/species-list";
import Skeleton from "../components/skeleton";
import { reducer, initialState } from "../reducer";
import { saveSeenSpecies } from "../firebase";
import useSyncLocalhost from "../hooks/use-sync-localhost";
import LocationSelect from "../components/location-select";
import useFetchSpecies from "../hooks/use-fetch-species";
import WelcomeMessage from "../components/welcome-message";
import SidebarToggle from "../components/sidebar-toggle";
import NoResults from "../components/no-results";
import FetchError from "../components/fetch-error";
import ResultsInfo from "../components/results-info";
import MainContent from "../components/main-content";
import usePostProcessSpecies from "../hooks/use-post-process-species";
import Head from "next/head";
import useFetchSeenSpecies from "../hooks/use-fetch-seen-species";

export default function Home() {
	const [state, dispatch] = React.useReducer(reducer, initialState);
	const { address, radius, species, expanded, seen, showSeen, isCacheRestored, showSidebar } = state;
	const { lat, lng } = address || {};

	useSyncLocalhost({dispatch, seen, showSeen, address, radius});

	useFetchSeenSpecies({dispatch});

	const { loading, error, lastUpdate, call } = useFetchSpecies({ lat, lng, radius, onCallback: (response) => {
		dispatch({ type: "set_species", payload: response })
	 }});

	 React.useEffect(() => {
		if (lat && lng) {
			call();
		}
	}, [lat, lng, radius, call]);

	const handleToggleExpand = (code) => {
		dispatch({ type: "expand_toggle", payload: code }); 
	}

	const addSeenSpecies = (code) => {
		dispatch({ type: "add_seen", payload: code });
		saveSeenSpecies([...seen, code]);
	}

	const removeSeenSpecies = (code) => {
		dispatch({ type: "remove_seen", payload: code });
		saveSeenSpecies(seen.filter(value => value !== code));
	}

	const handleAddressChange = React.useCallback((value) => {
		dispatch({ type: "set_address", payload: value });
	}, []);

	const handleFilterChange = (field, value) => {
		dispatch({ type: "filter_change", payload: { field, value } });
	}

	const { seenCount, filteredSpecies } = usePostProcessSpecies({species, expanded, seen, showSeen});

	const showWelcome = (!lat || !lng) && isCacheRestored;
	const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && ! error;

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

			<MainContent shouldRender={isCacheRestored} onClick={showSidebar ? () => dispatch({ type: "toggle_sidebar" }) : null}>
				{showWelcome && <WelcomeMessage/>}

				<div className="flex mb-4">
					<LocationSelect className="w-full mt-6" value={address} onChange={handleAddressChange}/>
					<SidebarToggle onClick={() => dispatch({type: "toggle_sidebar"})}/>
				</div>

				{error && <FetchError reload={call}/>}

				{loading && <Skeleton count={3}/>}

				{showNoResults && <NoResults reload={call}/>}

				<SpeciesList
					items={filteredSpecies}
					onToggleExpand={handleToggleExpand}
					onAddSeen={addSeenSpecies}
					onRemoveSeen={removeSeenSpecies}
					lat={lat}
					lng={lng}
				/>

				{filteredSpecies?.length > 0 &&
					<ResultsInfo
						count={filteredSpecies.length}
						total={species?.length}
						onReload={call}
						lastUpdate={lastUpdate}
					/>
				}
			</MainContent>
		</div>
	)
}