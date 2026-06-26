import "styles/globals.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { toast } from "react-hot-toast";
import * as idbKeyval from "idb-keyval";
import { get, setUnauthorizedHandler } from "lib/http";
import { teardownSession, IDB_CACHE_KEY } from "lib/logout";
import ErrorBoundary from "components/ErrorBoundary";
import { router } from "router";

const QUERY_CACHE_BUSTER = "birdplan-cache-v3";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 24 * 24 * 60 * 60 * 1000,
      staleTime: 0,
      queryFn: async ({ queryKey, meta }) => {
        const url = queryKey[0] as string;
        const isApiRoute = url.startsWith("/") && !url.startsWith(import.meta.env.VITE_OPENBIRDING_API_URL || "");
        const fullUrl = isApiRoute ? `${import.meta.env.VITE_API_URL}${url}` : url;
        return get(fullUrl, (queryKey[1] || {}) as any, !!meta?.showLoading);
      },
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

persistQueryClient({
  queryClient,
  persister: createAsyncStoragePersister({ storage: idbStorage, key: IDB_CACHE_KEY }),
  maxAge: 30 * 24 * 60 * 60 * 1000,
  buster: QUERY_CACHE_BUSTER,
});

setUnauthorizedHandler(async () => {
  await teardownSession(queryClient);
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ErrorBoundary>
);
