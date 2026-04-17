import React from "react";
import { Header, Body, Footer, useModal } from "providers/modals";
import Button from "components/Button";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";

export default function OpenBirding() {
  const { close } = useModal();
  const { trip } = useTrip();
  const [code, setCode] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);

  const generateCode = useMutation<{ shareCode: string; expiresAt: string }>({
    url: `/trips/${trip?._id}/share-code`,
    method: "POST",
    onSuccess: (data) => {
      setCode(data.shareCode);
      setExpiresAt(data.expiresAt);
    },
  });

  React.useEffect(() => {
    if (trip?._id) {
      generateCode.mutate(undefined);
    }
  }, [trip?._id]);

  React.useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = timeLeft !== null && timeLeft <= 0;
  const formatted = code ? `${code.slice(0, 3)} - ${code.slice(3)}` : "";

  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft !== null ? timeLeft % 60 : 0;

  return (
    <>
      <Header>Send to OpenBirding</Header>
      <Body className="min-h-0">
        <p className="text-gray-600 text-[15px] mb-4">
          Import this trip into the{" "}
          <a
            href="https://apps.apple.com/us/app/openbirding/id6755897167"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline"
          >
            OpenBirding
          </a>{" "}
          app by entering this code in the app's BirdPlan.app settings.
        </p>
        <div className="flex flex-col items-center my-4 gap-3">
          <div className="bg-gray-100 rounded-lg px-8 py-5">
            {generateCode.isPending ? (
              <span className="text-4xl font-semibold tracking-widest text-gray-400 font-mono">--- - ---</span>
            ) : isExpired ? (
              <span className="text-4xl font-semibold tracking-widest text-gray-400 font-mono line-through">
                {formatted}
              </span>
            ) : (
              <span className="text-4xl font-semibold tracking-widest text-gray-700 font-mono">{formatted}</span>
            )}
          </div>
          {isExpired ? (
            <button
              type="button"
              onClick={() => generateCode.mutate(undefined)}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              Code expired. Generate a new one?
            </button>
          ) : timeLeft !== null && !generateCode.isPending ? (
            <p className="text-sm text-gray-500">
              Expires in {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          ) : null}
        </div>
      </Body>
      <Footer>
        <Button onClick={close} color="gray">
          Done
        </Button>
      </Footer>
    </>
  );
}
