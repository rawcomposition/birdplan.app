import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import Button from "components/Button";
import { useProfile } from "providers/profile";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import Icon from "components/Icon";
import { useRouter } from "next/router";
import Link from "next/link";
import NotFound from "components/NotFound";
import useDownloadTargets from "hooks/useDownloadTargets";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";

const cutoff = "0.01%";

export default function ImportTargets() {
  const { is404, trip, canEdit } = useTrip();
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
    enabled: !!tripId && canEdit,
  });

  const mutation = useMutation({
    url: `/api/v1/trips/${tripId}/targets`,
    method: "PATCH",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/trips/${tripId}/targets`] });
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    },
  });

  const isUploading = mutation.isPending;
  const isDownloading = isLoading || isRefetching;
  const hasDownloadError = !!error || data?.items?.length === 0;
  const hasUploadError = mutation.isError;

  React.useEffect(() => {
    if (!tripId || !data || !data.items?.length) return;
    const filtered = data.items.filter(({ percent }) => percent >= Number(cutoff.replace("%", "")));
    mutation.mutate({ ...data, items: filtered });
  }, [data, tripId, is404]);

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Import Region Targets | BirdPlan.app</title>
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
          <h1 className="text-3xl font-bold text-gray-700 mb-8">🎯 Region Targets</h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8 flex flex-col gap-4">
            {isUploading ? (
              <div className="flex items-center flex-col gap-2 my-8">
                <h3 className="text-lg font-medium text-gray-700">Processing targets</h3>
                <p className="text-sm text-slate-600 mb-4">Almost done...</p>
                <Icon name="loading" className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : isDownloading ? (
              <div className="flex items-center flex-col gap-2 my-8">
                <h3 className="text-lg font-medium text-gray-700">Downloading from eBird</h3>
                <p className="text-sm text-slate-600 mb-4">This may take a minute...</p>
                <Icon name="loading" className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : hasUploadError ? (
              <div className="flex items-center flex-col gap-2 my-8">
                <Icon name="xMark" className="text-3xl text-red-500" />
                <h3 className="text-lg font-medium text-gray-700">Error processing targets</h3>
                <button className="text-sky-600 font-medium" onClick={() => router.reload()}>
                  Try Again
                </button>
              </div>
            ) : hasDownloadError ? (
              <div className="flex items-center flex-col gap-2 my-8">
                <Icon name="xMark" className="text-3xl text-red-500" />
                <h3 className="text-lg font-medium text-gray-700">Error downloading from eBird</h3>
                <button className="text-sky-600 font-medium" onClick={() => refetch()}>
                  Try Again
                </button>
              </div>
            ) : mutation.isSuccess ? (
              <div className="flex items-center flex-col gap-2 my-8">
                <Icon name="check" className="text-4xl text-green-500" />
                <h3 className="text-lg font-medium text-gray-700">Targets imported!</h3>
                <p className="text-sm text-slate-600 mb-4">Redirecting...</p>
              </div>
            ) : null}
          </div>

          <div className="flex">
            <Button href={redirectUrl} color="gray" className="inline-flex items-center ml-auto">
              Skip
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
