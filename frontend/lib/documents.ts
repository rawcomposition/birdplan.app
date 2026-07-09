import { TripDocument, TripDocumentCategory, TripDocumentVisibility } from "@birdplan/shared";
import {
  BedDouble,
  CarFront,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Globe,
  Lock,
  Map,
  Paperclip,
  Plane,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

export const DOCUMENT_CATEGORIES: { value: TripDocumentCategory; label: string; icon: LucideIcon }[] = [
  { value: "flights", label: "Flights", icon: Plane },
  { value: "lodging", label: "Lodging", icon: BedDouble },
  { value: "transport", label: "Transport", icon: CarFront },
  { value: "permits", label: "Permits & tickets", icon: Ticket },
  { value: "maps", label: "Maps & guides", icon: Map },
  { value: "other", label: "Other", icon: Paperclip },
];

export const DOCUMENT_VISIBILITIES: {
  value: TripDocumentVisibility;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { value: "private", label: "Only me", description: "Hidden from everyone else on the trip", icon: Lock },
  { value: "trip", label: "Trip participants", description: "Everyone on this trip can see it", icon: Users },
  { value: "public", label: "Anyone with the link", description: "Visible to anyone who can view the trip", icon: Globe },
];

const getMimeIcon = (mimeType: string): LucideIcon => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return FileText;
  if (/spreadsheet|excel|csv/.test(mimeType)) return FileSpreadsheet;
  return File;
};

export const getDocumentCategory = (doc: Pick<TripDocument, "category">) =>
  DOCUMENT_CATEGORIES.find((it) => it.value === doc.category);

export const getDocumentIcon = (doc: Pick<TripDocument, "mimeType" | "category">): LucideIcon =>
  getDocumentCategory(doc)?.icon || getMimeIcon(doc.mimeType);

export const getDocumentVisibility = (visibility?: TripDocumentVisibility) =>
  DOCUMENT_VISIBILITIES.find((it) => it.value === visibility) || DOCUMENT_VISIBILITIES[1];

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
