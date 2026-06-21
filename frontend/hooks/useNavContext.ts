import { useLocation, useSearchParams } from "react-router-dom";
import type { NavContext } from "lib/helpers";

export default function useNavContext(): NavContext {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  return {
    returnTo: searchParams.get("returnTo") ?? undefined,
    pathname: location.pathname,
    asPath: `${location.pathname}${location.search}`,
  };
}
