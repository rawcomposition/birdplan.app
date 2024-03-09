import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Footer from "components/Footer";

import { useRouter } from "next/router";
import Link from "next/link";

export default function Export() {
  const router = useRouter();
  const profileId = router.query.profileId || "";
  const tripId = router.query.tripId || "";

  if (!profileId || !tripId) return null;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Import Targets | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Link href={`/${tripId}`} className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
          ← Back to trip
        </Link>
        <div className="p-4 md:p-0 mt-8"></div>
        <iframe
          className="w-full h-[400px]"
          src={`/api/trips/${tripId}/export?profileId=${profileId}`}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </main>
      <Footer />
    </div>
  );
}
