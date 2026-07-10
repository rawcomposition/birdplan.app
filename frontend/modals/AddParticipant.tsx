import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { useTrip } from "hooks/useTrip";
import useMutation from "hooks/useMutation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";
import SegmentedControl from "components/SegmentedControl";
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
        <SegmentedControl
          className="mb-5"
          value={tab}
          onChange={setTab}
          options={[
            { value: "named", label: "Name Only" },
            { value: "invite", label: "Editor" },
          ]}
        />

        {tab === "invite" ? (
          <Field label="Email" className="pb-2">
            <Input
              size="sm"
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
          </Field>
        ) : (
          <Field label="Name" className="pb-2">
            <Input
              size="sm"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              autoFocus
            />
          </Field>
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
          <Button type="button" variant="link" onClick={() => setShowAttach(true)} className="mt-1 text-sm">
            + Attach life list
          </Button>
        )}
      </Body>
      <Footer>
        <Button onClick={close} variant="outline" disabled={addMutation.isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="default" disabled={!canSubmit || addMutation.isPending}>
          {addMutation.isPending ? "Saving..." : tab === "invite" ? "Send invite" : "Add participant"}
        </Button>
      </Footer>
    </>
  );
}
