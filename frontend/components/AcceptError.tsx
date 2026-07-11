import React from "react";
import { Alert } from "components/ui/alert";
import { Button } from "components/ui/button";

type Props = {
  title: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  children?: React.ReactNode;
};

export default function AcceptError({ title, message, onRetry, retrying, children }: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-gray-700">{title}</h2>
      <Alert variant="destructive" className="w-full justify-center text-center">
        {message || "Something went wrong."}
      </Alert>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} disabled={retrying}>
            {retrying ? "Trying again..." : "Try again"}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
