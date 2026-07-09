import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TripDocument } from "@birdplan/shared";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "components/ui/card";
import { Button } from "components/ui/button";
import { Spinner } from "components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import { mutate } from "lib/http";
import { formatBytes, getDocumentCategory, getDocumentIcon, getDocumentVisibility } from "lib/documents";
import { Upload, MoreHorizontal, PencilLine, Download, Trash2, FolderOpen } from "lucide-react";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export default function TripDocuments() {
  const { trip, canEdit } = useTrip();
  const { open } = useModal();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const queryKey = [`/trips/${trip?._id}/documents`];
  const { data: documents } = useQuery<TripDocument[]>({
    queryKey,
    enabled: !!trip,
  });

  if (!trip) return null;
  if (!canEdit && !documents?.length) return null;

  const uploadFile = async (file: File) => {
    if (file.size > MAX_DOCUMENT_BYTES) return toast.error("Files can be up to 10 MB");
    const mimeType = file.type || "application/octet-stream";
    setIsUploading(true);
    try {
      const { key, uploadUrl } = await mutate("POST", `/trips/${trip._id}/documents/upload-url`, {
        name: file.name,
        size: file.size,
        mimeType,
      });
      const res = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": mimeType } });
      if (!res.ok) throw new Error("Upload failed. Please try again.");
      await mutate("POST", `/trips/${trip._id}/documents`, {
        key,
        name: file.name,
        size: file.size,
        mimeType,
      });
      queryClient.invalidateQueries({ queryKey });
    } catch (error: any) {
      toast.error(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadFile(file);
  };

  const handleDelete = async (doc: TripDocument) => {
    if (!confirm(`Delete ${doc.name}?`)) return;
    try {
      await mutate("DELETE", `/trips/${trip._id}/documents/${doc._id}`);
      queryClient.setQueryData<TripDocument[]>(queryKey, (old) => old?.filter((it) => it._id !== doc._id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>
          Documents
          {!!documents?.length && (
            <span className="ml-2 text-sm font-medium text-muted-foreground tabular-nums">{documents.length}</span>
          )}
        </CardTitle>
        {canEdit && (
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Spinner /> : <Upload className="size-4" />}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="pt-3">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        {documents?.length ? (
          <ul className="flex flex-col divide-y divide-border/60">
            {documents.map((doc) => {
              const DocIcon = getDocumentIcon(doc);
              const category = getDocumentCategory(doc);
              const visibility = getDocumentVisibility(doc.visibility);
              return (
                <li key={doc._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <DocIcon className="size-4 text-secondary-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={doc.url || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-medium text-foreground hover:text-link"
                    >
                      {doc.name}
                    </a>
                    <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
                      <span className="whitespace-nowrap">
                        {category && <>{category.label} · </>}
                        {formatBytes(doc.size)}
                      </span>
                      {canEdit && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          · <visibility.icon aria-label={visibility.label} className="size-3" />
                          {visibility.label}
                        </span>
                      )}
                    </p>
                  </div>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Options for ${doc.name}`}
                            className="text-muted-foreground"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => open("editDocument", { document: doc })}>
                          <PencilLine /> Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={<a href={doc.url || undefined} target="_blank" rel="noreferrer" />}
                        >
                          <Download /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(doc)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center">
            <FolderOpen className="size-5 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              Flight itineraries, lodging confirmations, permits — keep the group&apos;s paperwork in one place.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
