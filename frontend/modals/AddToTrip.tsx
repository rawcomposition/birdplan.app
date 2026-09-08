import React from "react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TripImportInput, TripImportResponse, TripListPage } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import Select from "components/ReactSelectStyled";
import Field from "components/Field";
import { Option } from "lib/types";
import { formSelectStyles } from "lib/formStyles";
import useMutation from "hooks/useMutation";
import useSavedHotspots from "hooks/useSavedHotspots";
import { useModal } from "stores/modals";

type Props = {
  hotspots: { id: string; name: string }[];
  subtitle?: string;
};

export default function AddToTrip({ hotspots, subtitle }: Props) {
  const { close } = useModal();
  const queryClient = useQueryClient();
  const { savedHotspots } = useSavedHotspots();
  const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);
  const [includeNotes, setIncludeNotes] = React.useState(true);
  const [includeLabels, setIncludeLabels] = React.useState(true);

  const { data, isLoading } = useQuery<TripListPage>({
    queryKey: ["/trips", { limit: 50 }],
  });
  const options: Option[] = (data?.trips || []).map((it) => ({
    value: it._id,
    label: it.name,
  }));

  const ids = new Set(hotspots.map((it) => it.id));
  const savedRows = savedHotspots.filter((it) => ids.has(it.hotspotId));
  const hasNotes = savedRows.some((it) => !!it.notes);
  const hasLabels = savedRows.some((it) => it.labelIds.length > 0);

  const count = hotspots.length;
  const isSingle = count === 1;
  const verb = isSingle ? "Save" : "Import";

  const mutation = useMutation<TripImportResponse, TripImportInput>({
    url: `/trips/${selectedOption?.value}/hotspots/import`,
    method: "POST",
    onSuccess: ({ added }) => {
      queryClient.invalidateQueries({
        queryKey: [`/trips/${selectedOption?.value}`],
      });
      queryClient.invalidateQueries({ queryKey: ["/trips"] });
      toast.success(added === 0 ? "Already in this trip" : `Added ${added} hotspot${added === 1 ? "" : "s"}`);
      close();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;
    mutation.mutate({
      hotspotIds: hotspots.map((it) => it.id),
      includeNotes: hasNotes && includeNotes,
      includeLabels: hasLabels && includeLabels,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Header>{verb} to Trip</Header>
      <Body className="flex flex-col gap-5">
        <p className="-mt-2 text-sm text-muted-foreground">
          {subtitle || (isSingle ? hotspots[0].name : `${count} hotspots`)}
        </p>
        <Field label="Trip">
          <Select
            instanceId="addToTrip"
            options={options}
            value={selectedOption || undefined}
            onChange={setSelectedOption}
            isLoading={isLoading}
            placeholder="Select a trip"
            styles={formSelectStyles}
            menuPortalTarget={document.body}
          />
        </Field>
        {(hasNotes || hasLabels) && (
          <div className="flex flex-col gap-3">
            {hasNotes && (
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm">Copy my notes into the trip</span>
                <Switch checked={includeNotes} onCheckedChange={setIncludeNotes} />
              </label>
            )}
            {hasLabels && (
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm">Copy labels into the trip</span>
                <Switch checked={includeLabels} onCheckedChange={setIncludeLabels} />
              </label>
            )}
          </div>
        )}
      </Body>
      <Footer>
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!selectedOption}
          loading={mutation.isPending}
          loadingText={isSingle ? "Saving..." : "Importing..."}
        >
          {verb}
        </Button>
      </Footer>
    </form>
  );
}
