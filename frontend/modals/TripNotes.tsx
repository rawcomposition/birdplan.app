import React from "react";
import { Header, Body, Footer } from "components/Modal";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { useModal } from "stores/modals";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";

export default function TripNotes() {
  const { close } = useModal();
  const { trip } = useTrip();
  const [draft, setDraft] = React.useState(trip?.description || "");

  const mutation = useTripMutation<{ description: string }>({
    url: `/trips/${trip?._id}/description`,
    method: "PATCH",
    updateCache: (old, input) => ({ ...old, description: input.description }),
  });

  const handleSave = () => {
    mutation.mutate({ description: draft.trim() });
    close();
  };

  return (
    <>
      <Header>Trip notes</Header>
      <Body>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          autoFocus
          placeholder="Plans, goals, meeting details — anyone who can view the trip can read these notes."
        />
      </Body>
      <Footer>
        <Button onClick={handleSave}>Save notes</Button>
        <Button variant="ghost" onClick={close} className="ml-2">
          Cancel
        </Button>
      </Footer>
    </>
  );
}
