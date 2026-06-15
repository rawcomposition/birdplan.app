import React from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { Header, Body, Footer, useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import { parseLifelistCsv } from "lib/lifelistCsv";
import Button from "components/Button";
import Input from "components/Input";
import Icon from "components/Icon";

type Tab = "invite" | "named";

export default function AddParticipant() {
  const { close } = useModal();
  const { trip } = useTrip();
  const queryClient = useQueryClient();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [tab, setTab] = React.useState<Tab>("named");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [showAttach, setShowAttach] = React.useState(false);
  const [parsed, setParsed] = React.useState<{ fileName: string; sciNames: string[] } | null>(null);

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/participants`] });
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    close();
  };

  const addMutation = useMutation({
    url: `/trips/${trip?._id}/participants`,
    method: "POST",
    onSuccess: () => {
      toast.success(tab === "invite" ? "Invite sent" : "Participant added");
      invalidateAndClose();
    },
  });

  const pickFile = () => fileRef.current?.click();

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    try {
      const sciNames = await parseLifelistCsv(file);
      setParsed({ fileName: file.name, sciNames });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
    }
  };

  const canSubmit = tab === "invite" ? !!email.trim() : !!name.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const sciNames = parsed?.sciNames;
    if (tab === "invite") {
      addMutation.mutate({ type: "invite", email: email.trim(), sciNames });
    } else {
      addMutation.mutate({ type: "named", name: name.trim(), sciNames: sciNames ?? [] });
    }
  };

  return (
    <>
      <Header>Add a participant</Header>
      <Body className="min-h-0 pb-5">
        <div className="mb-5 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-sm">
          {(["named", "invite"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={clsx(
                "rounded-md px-3 py-1.5 font-medium transition-colors",
                tab === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t === "named" ? "Name Only" : "Editor"}
            </button>
          ))}
        </div>

        {tab === "invite" ? (
          <div className="pb-2">
            <label className="block mb-2">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Their email</span>
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="friend@example.com"
                autoFocus
              />
            </label>
            <p className="text-xs text-gray-500">
              They&apos;ll get an email to join. Once they accept, they manage their own life list.
            </p>
          </div>
        ) : (
          <div className="pb-2">
            <label className="block mb-2">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Name</span>
              <Input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                autoFocus
              />
            </label>
          </div>
        )}

        <input ref={fileRef} type="file" accept=".csv" className="sr-only" onChange={handlePick} />

        <AttachLifelist
          show={showAttach || !!parsed}
          parsed={parsed}
          onReveal={() => setShowAttach(true)}
          onHide={() => {
            setShowAttach(false);
            setParsed(null);
          }}
          onPick={pickFile}
          note={
            tab === "invite" ? "They can change this once they accept the invite." : undefined
          }
        />
      </Body>
      <Footer>
        <div className="flex justify-end gap-2 w-full">
          <Button onClick={close} color="grayOutline" disabled={addMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={!canSubmit || addMutation.isPending}>
            {addMutation.isPending ? "Saving..." : tab === "invite" ? "Send invite" : "Add participant"}
          </Button>
        </div>
      </Footer>
    </>
  );
}

type AttachProps = {
  show: boolean;
  parsed: { fileName: string; sciNames: string[] } | null;
  onReveal: () => void;
  onHide: () => void;
  onPick: () => void;
  note?: string;
};

function AttachLifelist({ show, parsed, onReveal, onHide, onPick, note }: AttachProps) {
  if (!show) {
    return (
      <button type="button" onClick={onReveal} className="mt-1 text-sm font-medium text-sky-600">
        + Attach life list
      </button>
    );
  }

  return (
    <div className="pt-1">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Life list</span>
        <button type="button" onClick={onHide} className="text-xs font-medium text-gray-400 hover:text-gray-600">
          Remove
        </button>
      </div>
      {parsed ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
            <Icon name="check" className="text-sm" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">{parsed.fileName}</p>
            <p className="text-xs text-gray-500 tabular-nums">{parsed.sciNames.length.toLocaleString()} species</p>
          </div>
          <button type="button" onClick={onPick} className="shrink-0 text-sm font-medium text-sky-600">
            Replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-4 py-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Icon name="feather" className="text-lg" />
          </span>
          <span className="text-sm font-medium text-gray-700">Choose a CSV file</span>
          <span className="text-xs text-gray-400">eBird .csv export</span>
        </button>
      )}
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </div>
  );
}
