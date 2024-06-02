import React from "react";
import { useRouter } from "next/router";

export default function useConfirmNavigation(isDirty: boolean) {
  const router = useRouter();

  React.useEffect(() => {
    const handleRouteChange = (url: string, { shallow }: { shallow: boolean }) => {
      if (isDirty && !window.confirm("Are you sure? Changes you made will not be saved.")) {
        router.events.emit("routeChangeError", "Route change aborted", url, { shallow });
        throw "Route change aborted.";
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [isDirty]);

  React.useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [isDirty]);
}
