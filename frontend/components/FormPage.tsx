import React from "react";
import { IconNameT } from "lib/icons";
import Header from "components/Header";
import Footer from "components/Footer";
import BackLink from "components/BackLink";
import Heading from "components/Heading";

type Props = {
  title: string;
  hat?: string;
  icon?: IconNameT;
  iconClassName?: string;
  subtitle?: React.ReactNode;
  back?: { to: string; label: string };
  documentTitle?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
};

export default function FormPage({
  title,
  hat,
  icon,
  iconClassName,
  subtitle,
  back,
  documentTitle,
  header,
  children,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {documentTitle && <title>{documentTitle}</title>}
      {header ?? <Header />}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mx-auto w-full max-w-xl px-4 py-6 pb-16 sm:px-6 sm:py-8">
          {back && <BackLink to={back.to} label={back.label} className="mb-5" />}
          <Heading
            hat={hat}
            title={title}
            icon={icon}
            iconClassName={iconClassName}
            subtitle={subtitle}
            className="mb-6"
          />
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
