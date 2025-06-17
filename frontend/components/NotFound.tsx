import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Not Found | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="flex-1 flex items-center justify-center text-gray-700">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-4">Page not found</p>
          <Link href="/" className="text-blue-500">
            Home page
          </Link>
        </div>
      </main>
    </div>
  );
}
