import React from "react";
import { IconNameT } from "lib/icons";
import Header from "components/Header";
import Footer from "components/Footer";
import BackLink from "components/BackLink";
import Heading from "components/Heading";
import PageContainer, { PageWidth } from "components/PageContainer";

type Props = {
  title: string;
  hat?: string;
  icon?: IconNameT;
  iconClassName?: string;
  subtitle?: React.ReactNode;
  back?: { to: string; label: string };
  documentTitle?: string;
  header?: React.ReactNode;
  maxWidth?: PageWidth;
  children: React.ReactNode;
};

export default function DashboardPage({
  title,
  hat,
  icon,
  iconClassName,
  subtitle,
  back,
  documentTitle,
  header,
  maxWidth = "2xl",
  children,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {documentTitle && <title>{documentTitle}</title>}
      {header ?? <Header />}
      <main className="flex-1 overflow-y-auto bg-background">
        <PageContainer width={maxWidth}>
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
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
