import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import Select from "components/ReactSelectStyled";
import { Option } from "lib/types";
import Button from "components/Button";
import { useProfile } from "providers/profile";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import Icon from "components/Icon";
import { useRouter } from "next/router";
import Link from "next/link";
import NotFound from "components/NotFound";
import clsx from "clsx";
import useConfirmNavigation from "hooks/useConfirmNavigation";
import useDownloadTargets from "hooks/useDownloadTargets";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";

const cutoffs = ["5%", "2%", "1%", "0.8%", "0.5%", "0.2%", "0.1%", "0%"];

export default function ImportTargets() {
  const [cutoff, setCutoff] = React.useState<Option>({ value: "1%", label: "1%" });
  const [isFinalizing, setIsFinalizing] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const { is404, trip } = useTrip();
  const { lifelist } = useProfile();
  const router = useRouter();
  const queryClient = useQueryClient();

  const tripId = trip?._id;
  const redirect = router.query.redirect || "";
  const showBack = router.query.back === "true";
  const region = trip?.region;
  const startMonth = trip?.startMonth || 1;
  const endMonth = trip?.endMonth || 12;
  const redirectUrl =
    lifelist.length > 0
      ? `/${tripId}/${redirect}`
      : `/import-lifelist?tripId=${tripId}&back=${showBack ? "true" : "false"}`;

  const { data, isLoading, isRefetching, error, refetch } = useDownloadTargets({
    region,
    startMonth,
    endMonth,
    enabled: true,
  });

  React.useEffect(() => {
    setIsDirty(!!data);
  }, [data]);

  useConfirmNavigation(isDirty);

  const mutation = useMutation({
    url: `/api/trips/${tripId}/targets`,
    method: "PATCH",
    onSuccess: () => {
      router.push(redirectUrl);
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/targets`] });
    },
  });

  const handleSubmit = async () => {
    if (!tripId || !data) return;
    const filtered = data.items.filter(({ percent }) => percent >= Number(cutoff.value.replace("%", "")));
    setIsDirty(false);
    setIsFinalizing(true);
    mutation.mutate({ ...data, items: filtered });
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Import Targets | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {showBack && (
          <Link
            href={`/${tripId}`}
            className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
          >
            ← Back to trip
          </Link>
        )}
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">🎯 Import Targets</h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8 flex flex-col gap-4">
            <h3 className="text-lg font-medium mb-4 text-gray-700">1. Download from eBird</h3>
            {(isLoading || isRefetching) && (
              <div className="flex gap-2 items-center">
                <Icon name="loading" className="animate-spin text-md text-slate-500" />
                <p className="text-md text-slate-600">This may take a minute...</p>
              </div>
            )}
            {!!error && !isRefetching && (
              <div className="flex gap-2 items-center">
                <Icon name="xMark" className="text-lg text-red-500" />
                <p className="text-md text-slate-600">Error downloading from eBird.</p>
                <button className="text-sky-600 font-medium" onClick={() => refetch()}>
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !isRefetching && !!data && (
              <div className="flex gap-2 items-center">
                <Icon name="check" className="text-lg text-green-500" />
                <p className="text-md text-slate-600">Targets download!</p>
              </div>
            )}
          </div>
          <div
            className={clsx(
              "pt-4 p-5 bg-white rounded-lg shadow mb-8",
              (!data || isRefetching || isLoading) && "opacity-60 pointer-events-none"
            )}
          >
            <h3 className="text-lg font-medium mb-4 text-gray-700">2. Choose a cutoff</h3>
            <label htmlFor="cutoff" className="text-sm text-gray-600 mb-2 block">
              Ignore targets below
            </label>
            <div className="max-w-xs">
              <Select
                id="cutoff"
                options={cutoffs.map((it) => ({ value: it, label: it }))}
                value={cutoff}
                onChange={setCutoff}
                menuPortalTarget={typeof document !== "undefined" && document.body}
              />
            </div>
          </div>

          <div className="flex">
            {!!cutoff && data && !isLoading && !isRefetching && !error ? (
              <Button
                onClick={handleSubmit}
                color="primary"
                className="inline-flex items-center ml-auto"
                disabled={isFinalizing}
              >
                {isFinalizing ? (
                  <>
                    <Icon name="loading" className="animate-spin text-md text-white" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  "Save Targets"
                )}
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
