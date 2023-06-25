import React from "react";
import Header from "components/Header";
import Head from "next/head";
import TripCard from "components/TripCard";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import { images } from "../images";

export default function ImagePreviews() {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Bird Planner</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <div className="p-4 md:p-0 mt-12">
          <div className="flex gap-8 items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-700">Image Previews</h1>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.keys(images).map((region) => (
              <TripCard
                key={region}
                trip={
                  {
                    id: region,
                    name: region,
                    region: region,
                    hotspots: [],
                  } as any
                }
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
