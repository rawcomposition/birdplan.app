import React from "react";
import Link from "next/link";
import Icon from "components/Icon";
import { useProfile } from "providers/profile";
import { useLocalStorage } from "usehooks-ts";

export default function RbaButton() {
  const [hasMounted, setHasMounted] = React.useState(false);
  const profile = useProfile();
  const profileLoaded = !!profile?.id;
  const shouldEnableExperimental = profile?.enableExperimental;
  const [enableExperimental, setEnableExperimental] = useLocalStorage("enableExperimental", false);

  React.useEffect(() => {
    if (!profileLoaded) return;
    setEnableExperimental(!!shouldEnableExperimental);
  }, [shouldEnableExperimental, profileLoaded]);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!enableExperimental || !hasMounted) return null;

  return (
    <Link
      href="/rba"
      className="bg-white rounded-lg shadow relative p-4 mb-8 flex items-center justify-between text-gray-700 font-bold md:mt-6"
    >
      <span>
        <span className="text-xl font-bold mr-3">🔥</span>
        View the lower 48 RBA
      </span>{" "}
      <Icon name="arrowRight" className="inline-block" />
    </Link>
  );
}
