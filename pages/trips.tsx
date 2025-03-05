import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Button from "components/Button";
import TripCard from "components/TripCard";
import Link from "next/link";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import Notice from "components/Notice";
import { useQuery } from "@tanstack/react-query";
import { Trip } from "lib/types";
import { useUser } from "providers/user";
import Error from "components/Error";

export default function Trips() {
  const { user } = useUser();

  const { data, isLoading, error, refetch } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
    enabled: !!user?.uid,
  });

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Trips | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <div className="p-4 md:p-0">
          <div className="flex gap-8 items-center mb-8 mt-4 md:mt-8">
            <h1 className="text-3xl font-bold text-gray-700">My Trips</h1>
            <Button color="pillPrimary" size="md" href="/create" className="pr-6">
              <span className="text-xl font-bold leading-4">+</span>&nbsp;&nbsp;Create Trip
            </Button>
          </div>
          <Notice />
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {data?.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
          {isLoading && <p className="text-gray-500 text-lg">Loading...</p>}
          {!isLoading && data?.length === 0 && (
            <p className="text-gray-500 text-lg">
              You don&apos;t have any trips yet.{" "}
              <Link className="text-blue-600 font-bold" href="/create">
                Create one!
              </Link>
            </p>
          )}
          {error && <Error onReload={refetch} message="Error loading trips" />}
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
