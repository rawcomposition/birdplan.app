import React from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { useTrip } from "hooks/useTrip";
import useMutation from "hooks/useMutation";
import Button from "components/Button";
import Input from "components/Input";
import LifelistField from "components/LifelistField";

type Tab = "invite" | "named";

export default function AddParticipant() {
  const { close } = useModal();
  const { trip } = useTrip();
  const queryClient = useQueryClient();

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
                tab === t ? "bg-white text-gray-800 shadow-xs" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t === "named" ? "Name Only" : "Editor"}
            </button>
          ))}
        </div>

        {tab === "invite" ? (
          <div className="pb-2">
            <label className="block mb-2">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Email</span>
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

        {showAttach || parsed ? (
          <LifelistField
            hasList={!!parsed}
            count={parsed?.sciNames.length ?? 0}
            cardLabel={parsed?.fileName ?? ""}
            onImport={(sciNames, fileName) => setParsed({ fileName, sciNames })}
            onRemove={() => {
              setShowAttach(false);
              setParsed(null);
            }}
            footer={tab === "invite" ? "They can change this once they accept the invite." : undefined}
          />
        ) : (
          <Button type="button" color="link" size="none" onClick={() => setShowAttach(true)} className="mt-1 text-sm">
            + Attach life list
          </Button>
        )}
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
