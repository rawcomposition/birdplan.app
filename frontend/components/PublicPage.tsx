import React from "react";
import Footer from "components/Footer";
import HomeHeader from "components/HomeHeader";

type Props = {
  documentTitle?: string;
  children: React.ReactNode;
};

export default function PublicPage({ documentTitle, children }: Props) {
  return (
    <div className="flex flex-col h-full">
      {documentTitle && <title>{documentTitle}</title>}
      <HomeHeader />
      <main className="container px-4">{children}</main>
      <Footer />
    </div>
  );
}
