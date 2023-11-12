import React from "react";
import Head from "next/head";

type PropTypes = {
  heading: string;
  children: React.ReactNode;
};

export default function UtilityPage({ heading, children }: PropTypes) {
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 px-4 md:min-h-[600px]">
      <Head>
        <title>{heading}</title>
      </Head>
      <div className="flex flex-col items-center">
        <img src="/icon.png" className="w-[80px] max-auto" width="50" height="50" />
        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">{heading}</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">{children}</div>
      </div>
    </div>
  );
}
