import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import LifelistEditor from "components/LifelistEditor";
import { useTrip } from "providers/trip";
import useLifelistMode from "hooks/useLifelistMode";

export default function TripLifelist() {
  const router = useRouter();
  const { trip, is404 } = useTrip();
  const lifelistMode = useLifelistMode(trip);

  const from = typeof router.query.from === "string" ? router.query.from : null;
  const doneHref = from === "create" ? `/${trip?._id}/participants?new=1` : `/${trip?._id}`;
  const doneLabel = from === "create" ? "Continue" : "Done";

  const handleDone = async () => {
    await lifelistMode.save();
    router.push(doneHref);
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Trip Life List | BirdPlan.app</title>
      </Head>

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            <Icon name="feather" className="text-2xl text-lime-600" /> Trip Life List
          </h1>
          <p className="text-gray-500 mb-8">Choose which life list to use for determining your trip targets.</p>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            {trip ? (
              <LifelistEditor trip={trip} mode={lifelistMode} embedded />
            ) : (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Icon name="loading" className="animate-spin" /> Loading...
              </div>
            )}
          </div>

          <div className="flex">
            <Button onClick={handleDone} color="primary" className="inline-flex items-center ml-auto">
              {doneLabel}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
