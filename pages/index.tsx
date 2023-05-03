import React from "react";
import Header from "components/Header";
import Head from "next/head";
import useTrips from "hooks/useTrips";
import { useModal } from "providers/modals";
import Button from "components/Button";
import TripCard from "components/TripCard";
import Sidebar from "components/Sidebar";
import { useUI } from "providers/ui";
import Link from "next/link";
import ArrowRight from "icons/ArrowRight";
import LoginModal from "components/LoginModal";

export default function Planner() {
  const { trips, loading, deleteTrip } = useTrips();
  const { open } = useModal();
  const { closeSidebar } = useUI();

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Bird Planner</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0 mt-12" onClick={closeSidebar}>
          <div className="flex gap-8 items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-700">Your trips</h1>
            <Button color="pillPrimary" size="md" onClick={() => open("createTrip")} className="pr-6">
              <span className="text-xl font-bold leading-4">+</span>&nbsp;&nbsp;Create Trip
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={deleteTrip} />
            ))}
          </div>
          {loading && <p className="text-gray-500 text-lg">Loading...</p>}
          {!loading && trips.length === 0 && (
            <p className="text-gray-500 text-lg">
              You don&apos;t have any trips yet.{" "}
              <button type="button" className="text-blue-600 font-bold" onClick={() => open("createTrip")}>
                Create one!
              </button>
            </p>
          )}
          <h2 className="text-xl mt-16 mb-1 font-bold text-gray-700">Rare Bird Alert</h2>
          <Link href="/rba" className="font-bold">
            View rare birds near me <ArrowRight className="inline-block" />
          </Link>
        </div>
      </main>
      <footer className="mt-auto text-center text-sm text-gray-500 border-t mb-4 pt-4 hidden md:block">
        Developed by{" "}
        <a href="https://rawcomposition.com" target="_blank">
          RawComposition
        </a>
        <span className="mx-2">•</span>
        <a href="https://rawcomposition.com/about" target="_blank">
          Contact
        </a>
        <span className="mx-2">•</span>
        <a href="https://github.com/rawcomposition/bird-planner" target="_blank">
          Github
        </a>
      </footer>
      <LoginModal />
    </div>
  );
}
