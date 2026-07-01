import React from "react";
import Card from "components/Card";
import Icon from "components/Icon";
import { IconNameT } from "lib/icons";
import { cn } from "lib/utils";

type Props = {
  title: string;
  description?: React.ReactNode;
  icon?: IconNameT;
  action?: React.ReactNode;
  className?: string;
};

export default function EmptyState({ title, description, icon, action, className }: Props) {
  return (
    <Card className={cn("flex flex-col items-center gap-2 p-6 text-center", className)}>
      {icon && <Icon name={icon} className="text-3xl text-gray-400" />}
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {description && <p className="max-w-md text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}
