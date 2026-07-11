import React from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { Card } from "components/ui/card";

type Props = {
  title: string;
  action?: { label: string; to: string };
  className?: string;
  children: React.ReactNode;
};

export default function WidgetCard({ title, action, className, children }: Props) {
  return (
    <Card className={clsx("px-5 py-4", className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h2 className="text-xs font-bold tracking-widest text-foreground uppercase">{title}</h2>
        {action && (
          <Link to={action.to} className="text-xs font-bold text-link">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </Card>
  );
}
