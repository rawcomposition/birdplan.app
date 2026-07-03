import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { TripDocument } from "@birdplan/shared";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "components/ui/card";
import { Button } from "components/ui/button";
import { Spinner } from "components/ui/spinner";
import { useTrip } from "hooks/useTrip";
import { mutate } from "lib/http";
import { FileText, Upload, Trash2 } from "lucide-react";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function TripDocuments() {
  const { trip, canEdit } = useTrip();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const queryKey = [`/trips/${trip?._id}/documents`];
  const { data: documents } = useQuery<TripDocument[]>({
    queryKey,
    enabled: !!trip && canEdit,
  });

  if (!trip || !canEdit) return null;

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
    setDeletingId(doc._id);
    try {
      await mutate("DELETE", `/trips/${trip._id}/documents/${doc._id}`);
      queryClient.setQueryData<TripDocument[]>(queryKey, (old) => old?.filter((it) => it._id !== doc._id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-0">
        <CardTitle>Documents</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Spinner /> : <Upload className="size-4" />}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-3">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        {documents?.length ? (
          <ul className="flex flex-col divide-y divide-border/60">
            {documents.map((doc) => (
              <li key={doc._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <a
                    href={doc.url || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium text-foreground hover:text-link"
                  >
                    {doc.name}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(doc.size)}
                    {doc.createdAt && <> · {dayjs(doc.createdAt).format("MMM D, YYYY")}</>}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${doc.name}`}
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc._id}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {deletingId === doc._id ? <Spinner /> : <Trash2 className="size-4" />}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Flight itineraries, lodging confirmations, permits — keep the group&apos;s paperwork in one place. Only
            trip participants can see documents.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
