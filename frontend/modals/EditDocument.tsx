import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TripDocument, TripDocumentCategory, TripDocumentUpdateInput, TripDocumentVisibility } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "components/ui/select";
import { useModal } from "stores/modals";
import { useTrip } from "hooks/useTrip";
import useMutation from "hooks/useMutation";
import { DOCUMENT_CATEGORIES, DOCUMENT_VISIBILITIES, getDocumentVisibility } from "lib/documents";
import toast from "react-hot-toast";

type Props = {
  document: TripDocument;
};

export default function EditDocument({ document: doc }: Props) {
  const { close } = useModal();
  const { trip } = useTrip();
  const queryClient = useQueryClient();
  const [name, setName] = React.useState(doc.name);
  const [category, setCategory] = React.useState<TripDocumentCategory | "none">(doc.category || "none");
  const [visibility, setVisibility] = React.useState<TripDocumentVisibility>(doc.visibility || "trip");

  const mutation = useMutation<TripDocument, TripDocumentUpdateInput>({
    url: `/trips/${trip?._id}/documents/${doc._id}`,
    method: "PATCH",
    onSuccess: (updated) => {
      queryClient.setQueryData<TripDocument[]>([`/trips/${trip?._id}/documents`], (old) =>
        old?.map((it) => (it._id === updated._id ? updated : it))
      );
      close();
    },
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error("Please enter a name");
    mutation.mutate({ name: name.trim(), category: category === "none" ? null : category, visibility });
  };

  return (
    <>
      <Header>Edit document</Header>
      <Body className="flex flex-col gap-4">
        <Field label="Name">
          <Input size="sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Category" isOptional>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as TripDocumentCategory | "none")}
            items={[
              { value: "none", label: "No category" },
              ...DOCUMENT_CATEGORIES.map(({ value, label }) => ({ value, label })),
            ]}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {DOCUMENT_CATEGORIES.map(({ value, label, icon: CategoryIcon }) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <CategoryIcon className="size-4 text-muted-foreground" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Who can see it">
          <Select
            value={visibility}
            onValueChange={(value) => setVisibility(value as TripDocumentVisibility)}
            items={DOCUMENT_VISIBILITIES.map(({ value, label }) => ({ value, label }))}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_VISIBILITIES.map(({ value, label, icon: VisibilityIcon }) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <VisibilityIcon className="size-4 text-muted-foreground" />
                    {label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1.5 text-xs text-muted-foreground">{getDocumentVisibility(visibility).description}</p>
        </Field>
      </Body>
      <Footer>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          Save
        </Button>
        <Button variant="ghost" onClick={close} className="ml-2">
          Cancel
        </Button>
      </Footer>
    </>
  );
}
