import React from "react";
import { Link } from "react-router-dom";
import { IconNameT } from "lib/icons";
import { cn } from "lib/utils";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";

type Props = {
  title: string;
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
        <div className="max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-16">
          {back && (
            <Link
              to={back.to}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 mb-5"
            >
              <Icon name="angleLeft" className="text-xs" />
              {back.label}
            </Link>
          )}
          <div className="mb-6">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-gray-800">
              {icon && <Icon name={icon} className={cn("text-xl text-gray-500", iconClassName)} />}
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
