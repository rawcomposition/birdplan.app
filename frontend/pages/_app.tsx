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
import { get } from "lib/http";
import { toast } from "react-hot-toast";
import ErrorBoundary from "components/ErrorBoundary";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useEffect } from "react";
import * as idbKeyval from "idb-keyval";

let queryClient: QueryClient | undefined;

export function initQueryClient() {
  // Fix for nextjs hot reloading
  if (queryClient) return queryClient;

  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        gcTime: 24 * 24 * 60 * 60 * 1000, // 24 days
        staleTime: 0,
        queryFn: async ({ queryKey, meta }) =>
          get(`${process.env.NEXT_PUBLIC_API_URL}${queryKey[0]}`, (queryKey[1] || {}) as any, !!meta?.showLoading),
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
      // Create a simple storage interface using idb-keyval
      const idbStorage = {
        async getItem(key: string) {
          try {
            return await idbKeyval.get(key);
          } catch (error) {
            console.error("Error getting item from IndexedDB", error);
            return null;
          }
        },
        async setItem(key: string, value: string) {
          try {
            await idbKeyval.set(key, value);
          } catch (error) {
            console.error("Error setting item in IndexedDB", error);
          }
        },
        async removeItem(key: string) {
          try {
            await idbKeyval.del(key);
          } catch (error) {
            console.error("Error removing item from IndexedDB", error);
          }
        },
      };

      const asyncPersister = createAsyncStoragePersister({
        storage: idbStorage,
        key: "BIRDPLAN_QUERY_CACHE",
      });

      persistQueryClient({
        queryClient: queryClient!,
        persister: asyncPersister,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        buster: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
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
