import React from "react";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { XIcon } from "lucide-react";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";

type Props = {
  name: string;
  code: string;
};

export default function Trip({ name, code }: Props) {
  const { modalId } = useModal();
  const { setSelectedSpecies, trip } = useTrip();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalId) {
        setSelectedSpecies(undefined);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalId]);

  return (
    <Card className="absolute top-3 left-1/2 z-10 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 p-4 shadow-md">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold inline-flex gap-1.5 items-center">
          {name}
        </h2>
        <Button
          variant="ghost"
          size="icon-lg"
          className="ml-auto"
          onClick={() => setSelectedSpecies(undefined)}
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">
        Showing reports over the last 30 days.{" "}
        <a
          href={`https://ebird.org/map/${code}?env.minX=${trip?.bounds?.minX}&env.minY=${trip?.bounds?.minY}&env.maxX=${trip?.bounds?.maxX}&env.maxY=${trip?.bounds?.maxY}`}
          className="text-link"
          target="_blank"
        >
          View on eBird
        </a>
      </p>
    </Card>
  );
}
