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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
