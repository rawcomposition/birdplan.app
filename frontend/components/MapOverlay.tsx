import React from "react";
import { Card } from "components/ui/card";
import { Button } from "components/ui/button";
import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useModal } from "stores/modals";
import { cn } from "lib/utils";

type Props = {
  onClose: () => void;
  closeVariant?: "dismiss" | "back";
  className?: string;
  children: React.ReactNode;
  title: string;
};

export default function MapOverlay({ onClose, closeVariant = "dismiss", title, className, children }: Props) {
  const { modalId } = useModal();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalId) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalId, onClose]);

  return (
    <Card
      className={cn(
        "absolute top-3 left-1/2 z-10 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 p-4 shadow-md",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="text-xs text-muted-foreground mt-1.5">{children}</div>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          className="-mr-1 -mt-1 shrink-0"
          onClick={onClose}
          aria-label={closeVariant === "back" ? "Back" : "Close"}
        >
          {closeVariant === "back" ? <ArrowLeftIcon className="size-5" /> : <XIcon className="size-5" />}
        </Button>
      </div>
    </Card>
  );
}
