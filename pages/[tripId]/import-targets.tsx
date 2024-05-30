import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import Button from "components/Button";
import { useProfile } from "providers/profile";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import { Target } from "lib/types";
import Icon from "components/Icon";
import { useRouter } from "next/router";
import Link from "next/link";
import NotFound from "components/NotFound";
import { useQuery } from "@tanstack/react-query";

export default function ImportTargets() {
  const { is404, trip, setTargets } = useTrip();
  const { lifelist } = useProfile();
  const router = useRouter();
  const tripId = trip?.id;
  const redirect = router.query.redirect || "";
  const showBack = router.query.back === "true";
  const region = trip?.region;
  const startMonth = trip?.startMonth || 1;
  const endMonth = trip?.endMonth || 12;
  const redirectUrl =
    lifelist.length > 0
      ? `/${trip?.id}/${redirect}`
      : `/import-lifelist?tripId=${trip?.id}&back=${showBack ? "true" : "false"}`;

  const { data, isLoading, isRefetching, error, refetch } = useQuery<{ items: Target[]; N: number; yrN: number }>({
    queryKey: [
      "https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-6c6abe6c-b02b-4b79-a86e-f7633e99a025/targets/get",
      { startMonth, endMonth, region },
    ],
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0,
    enabled: false,
  });

  React.useEffect(() => {
    if (data && tripId) {
      setTargets({ ...data, tripId });
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    }
  }, [data, tripId]);

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Import Targets | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {showBack && (
          <Link href={`/${trip?.id}`} className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
            ← Back to trip
          </Link>
        )}
        <div className="p-4 md:p-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">🎯 Import Targets</h1>
          {(isLoading || isRefetching) && (
            <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8 flex flex-col items-center text-center gap-4">
              <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
              <p className="text-md text-slate-600">Importing from eBird, this may take a minute...</p>
            </div>
          )}
          {!!error && !isRefetching && (
            <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8 flex flex-col items-center text-center gap-4">
              <p className="text-md text-red-600">Error importing from eBird.</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          )}
          {!isLoading && !isRefetching && !!data && (
            <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8 flex flex-col items-center text-center gap-2">
              <Icon name="check" className="text-4xl text-slate-500" />
              <p className="text-md text-slate-600">Targets imported!</p>
            </div>
          )}

          <div className="flex">
            {!!data ? (
              <Button href={redirectUrl} color="primary" className="inline-flex items-center ml-auto">
                Continue
              </Button>
            ) : (
              <Button href={redirectUrl} color="gray" className="inline-flex items-center ml-auto">
                Skip
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
