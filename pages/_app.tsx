import type { AppProps } from "next/app";
import "styles/globals.css";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";
import { ProfileProvider } from "providers/profile";
import { TripProvider } from "providers/trip";
import { HotspotTargetsProvider } from "providers/hotspot-targets";
import { SpeciesImagesProvider } from "providers/species-images";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { get } from "lib/helpers";
import { toast } from "react-hot-toast";
import ErrorBoundary from "components/ErrorBoundary";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useEffect } from "react";

let queryClient: QueryClient | undefined;

export function initQueryClient() {
  // Fix for nextjs hot reloading
  if (queryClient) return queryClient;

  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
        staleTime: 0,
        queryFn: async ({ queryKey, meta }) =>
          get(queryKey[0] as string, (queryKey[1] || {}) as any, !!meta?.showLoading),
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.errorMessage) {
          toast.error(query.meta.errorMessage.toString());
        }
      },
    }),
  });

  return queryClient;
}

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
        key: "BIRDPLAN_QUERY_CACHE",
      });

      persistQueryClient({
        queryClient: queryClient!,
        persister: localStoragePersister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={initQueryClient()}>
        <SpeciesImagesProvider>
          <UserProvider>
            <Toaster containerStyle={{ zIndex: 10001 }} />
            <ProfileProvider>
              <TripProvider>
                <HotspotTargetsProvider>
                  <ModalProvider>
                    <Component {...pageProps} />
                  </ModalProvider>
                </HotspotTargetsProvider>
              </TripProvider>
            </ProfileProvider>
          </UserProvider>
        </SpeciesImagesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
