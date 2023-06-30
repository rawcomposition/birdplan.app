import type { AppProps } from "next/app";
import "styles/globals.css";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";
import { ProfileProvider } from "providers/profile";
import { TripProvider } from "providers/trip";
import { Toaster } from "react-hot-toast";
import { UIProvider } from "providers/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { get } from "lib/helpers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => get(queryKey[0] as string, (queryKey[1] || {}) as any),
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 20 * 60 * 1000, // 20 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Toaster containerStyle={{ zIndex: 10001 }} />
        <ProfileProvider>
          <TripProvider>
            <UIProvider>
              <ModalProvider>
                <Component {...pageProps} />
              </ModalProvider>
            </UIProvider>
          </TripProvider>
        </ProfileProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
