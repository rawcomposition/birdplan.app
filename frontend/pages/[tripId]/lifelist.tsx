import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "components/Header";
import Heading from "components/Heading";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import Card from "components/Card";
import NotFound from "components/NotFound";
import LifelistEditor from "components/LifelistEditor";
import { useTrip } from "hooks/useTrip";
import useLifelistMode from "hooks/useLifelistMode";

export default function TripLifelist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trip, is404 } = useTrip();
  const lifelistMode = useLifelistMode(trip);

  const from = searchParams.get("from");
  const doneHref = from === "create" ? `/${trip?._id}/participants?new=1` : `/${trip?._id}`;
  const doneLabel = from === "create" || from === "accept" ? "Continue" : "Done";

  const handleDone = async () => {
    await lifelistMode.save();
    navigate(doneHref);
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
        <title>Trip Life List | BirdPlan.app</title>

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <div className="px-4 md:px-0 mt-8">
          <Heading
            title="Trip Life List"
            icon="feather"
            iconClassName="text-lime-600"
            subtitle="Choose which life list to use for determining your trip targets."
            className="mb-8"
          />

          <Card className="rounded-2xl p-5 mb-6">
            {trip ? (
              <LifelistEditor trip={trip} mode={lifelistMode} embedded />
            ) : (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Icon name="loading" className="animate-spin" /> Loading...
              </div>
            )}
          </Card>

          <div className="flex">
            <Button onClick={handleDone} color="primary" className="inline-flex items-center ml-auto">
              {doneLabel}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
