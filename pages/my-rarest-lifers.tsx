import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Footer from "components/Footer";
import Icon from "components/Icon";

export default function ImportLifelist() {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Rarest Lifers | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <div className="p-4 md:p-0 mt-12">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Icon name="feather" className="text-2xl text-lime-600" /> My Rarest Lifers
          </h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            This feature is no longer available. eBird has not published an updated version of the Macaulay Library
            stats since the 2023 taxonomy update.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
