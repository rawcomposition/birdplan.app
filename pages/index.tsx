import React from "react";
import Head from "next/head";
import Button from "components/Button";
import Icon from "components/Icon";
import { useUser } from "providers/user";
import Footer from "components/Footer";
import HomeHeader from "components/HomeHeader";

const features = [
  {
    name: "Find your targets.",
    description: "Import your life list and regional targets from eBird to filter results by your target species.",
    icon: "bins",
  },
  {
    name: "Save hotspots.",
    description: "Save interesting hotspots to your trip to easily find them later. You can also add notes.",
    icon: "star",
  },
  {
    name: "Find recent sightings.",
    description: "With your life list uploaded, view recent sightings of your target species.",
    icon: "feather",
  },
  {
    name: "Save custom markers.",
    description: "Add your hotel, Airbnb, airport, or other points of interest.",
    icon: "markerPlus",
  },
  {
    name: "Manage itinerary.",
    description: "Plan your daily schedule by adding hotspots. Travel time is auto calculated between locations",
    icon: "calendar",
  },
  {
    name: "Invite collaborators.",
    description: "Easily invite editors to help you plan your trip. You can also share a view-only link.",
    icon: "user",
  },
];

export default function BirdPlan() {
  const { user } = useUser();
  const isLoggedIn = !!user?.uid;
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>BirdPlan.app - Plan Your Next Birding Adventure</title>
      </Head>

      <HomeHeader />
      <main className="container px-4">
        <div className="flex flex-col items-center justify-center py-8 md:py-12 lg:py-16">
          <h1 className="text-gray-800 sm:leading-normal lg:leading-normal font-bold text-center mb-8 text-3xl sm:text-5xl lg:text-7xl">
            The easiest way to plan your next birding trip
          </h1>
          <p className="text-xl text-center max-w-2xl mb-8">
            BirdPlan.app is a tool for birders to plan their birding adventures. Save hotspots, add custom markers, find
            target species, view recent species reports, and more!
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <Button color="pillPrimary" size="lg" href={isLoggedIn ? "/trips" : "/signup"}>
              <span className="px-6">Get Started</span>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden pt-8 md:pt-16 mb-12 md:mb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <img
              src="/screenshot6.jpg"
              alt="App screenshot"
              className="mb-[-12%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
              width="2400"
              height="1557"
            />
            <div className="relative" aria-hidden="true">
              <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-[#fbfbfd] pt-[7%]"></div>
            </div>
          </div>
        </div>
        <h1 className="text-4xl text-gray-800 leading-normal font-bold text-center">Features</h1>
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8 mb-16 sm:mb-24 md:mb-32">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-11">
                <dt className="inline font-semibold text-gray-900">
                  <Icon
                    name={feature.icon as any}
                    className="absolute left-1 top-1 text-2xl text-blue-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>{" "}
                <dd className="inline">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-slate-900 w-full p-16 rounded-xl mb-16">
          <div className="container flex flex-col items-center justify-center">
            <h1 className="text-4xl text-white leading-normal font-bold text-center mb-3">Ready to get started?</h1>
            <p className="text-xl text-white text-center max-w-2xl mb-10">
              BirdPlan.app is free to use. Create an account to get started.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button color="pillPrimary" size="lg" href={isLoggedIn ? "/trips" : "/signup"}>
                <span className="px-6">Get Started</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
