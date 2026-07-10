import React from "react";
import { Card } from "components/ui/card";
import { Alert } from "components/ui/alert";
import { Button } from "components/ui/button";
import Icon from "components/Icon";
import { IconNameT } from "lib/icons";
import { cn } from "lib/utils";

type Props = {
  title: string;
  description?: React.ReactNode;
  icon?: IconNameT;
  action?: React.ReactNode;
  onRetry?: () => void;
  inline?: boolean;
  className?: string;
  variant?: "default" | "destructive";
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
  onRetry,
  inline,
  className,
  variant = "default",
}: Props) {
  const isDestructive = variant === "destructive";

  if (inline) {
    return (
      <Alert variant={isDestructive ? "destructive" : "muted"} className={cn("-mx-1 my-1", className)}>
        {isDestructive && <Icon name="xMarkCircle" className="text-xl" />}
        <span>
          {title}
          {onRetry && (
            <>
              {" "}
              <span className="text-destructive/40">—</span>{" "}
              <Button variant="link-danger" className="px-0 py-0" onClick={onRetry}>
                Retry
              </Button>
            </>
          )}
        </span>
      </Alert>
    );
  }

  return (
    <Card className={cn("flex flex-col items-center gap-2 p-6 text-center", className)}>
      {icon && <Icon name={icon} className={cn("text-3xl", isDestructive ? "text-destructive/70" : "text-gray-400")} />}
      <h3 className={cn("text-lg font-medium", isDestructive ? "text-destructive" : "text-gray-700")}>{title}</h3>
      {description && <p className="max-w-md text-sm text-gray-500">{description}</p>}
      {onRetry && (
        <div className="mt-2">
          <Button variant={isDestructive ? "outline-destructive" : "outline"} onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}
