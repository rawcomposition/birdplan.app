import React from "react";
import Header from "components/Header";
import Head from "next/head";
import useTrips from "hooks/useTrips";
import Button from "components/Button";
import TripCard from "components/TripCard";
import Sidebar from "components/Sidebar";
import { useUI } from "providers/ui";
import Link from "next/link";
import ArrowRight from "icons/ArrowRight";
import LoginModal from "components/LoginModal";
import { useProfile } from "providers/profile";
import Footer from "components/Footer";

export default function Trips() {
  const { trips, loading } = useTrips();
  const { enableExperimental } = useProfile();
  const { closeSidebar } = useUI();

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Trips | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0" onClick={closeSidebar}>
          {enableExperimental && (
            <Link
              href="/rba"
              className="bg-white rounded-lg shadow relative p-4 mb-8 flex items-center justify-between text-gray-700 font-bold"
            >
              <span>
                <span className="text-xl font-bold mr-3">🔥</span>
                View the lower 48 RBA
              </span>{" "}
              <ArrowRight className="inline-block" />
            </Link>
          )}
          <div className="flex gap-8 items-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-700">My Trips</h1>
            <Button color="pillPrimary" size="md" href="/create" className="pr-6">
              <span className="text-xl font-bold leading-4">+</span>&nbsp;&nbsp;Create Trip
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
          {loading && <p className="text-gray-500 text-lg">Loading...</p>}
          {!loading && trips.length === 0 && (
            <p className="text-gray-500 text-lg">
              You don&apos;t have any trips yet.{" "}
              <Link className="text-blue-600 font-bold" href="/create">
                Create one!
              </Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
