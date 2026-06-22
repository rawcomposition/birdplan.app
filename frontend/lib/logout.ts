import * as idbKeyval from "idb-keyval";
import type { QueryClient } from "@tanstack/react-query";
import { clearSessionToken } from "lib/sessionToken";

export const IDB_CACHE_KEY = "BIRDPLAN_QUERY_CACHE";

export async function teardownSession(queryClient: QueryClient) {
  clearSessionToken();
  queryClient.clear();
  await idbKeyval.del(IDB_CACHE_KEY);
}
