import React from "react";
import Head from "next/head";
import Link from "next/link";
import Logo from "components/Logo";

type PropTypes = {
  heading: React.ReactNode;
  title?: string;
  children: React.ReactNode;
};

export default function UtilityPage({ heading, title, children }: PropTypes) {
  const documentTitle = title ?? (typeof heading === "string" ? heading : undefined);
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 px-4 md:min-h-[600px]">
      {documentTitle && (
        <Head>
          <title>{documentTitle}</title>
        </Head>
      )}
      <div className="flex flex-col items-center">
        <Link href="/" aria-label="BirdPlan.app home">
          <Logo className="w-[80px] mx-auto" />
        </Link>
        {typeof heading === "string" ? (
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">{heading}</h2>
        ) : (
          <div className="mt-6 text-center">{heading}</div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">{children}</div>
      </div>
    </div>
  );
}
