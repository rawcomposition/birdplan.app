import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, authenticateOptional, nanoId, sanitizeFileName } from "lib/utils.js";
import { connect, Trip, TripDocument } from "lib/db.js";
import { isTripEditor, isEditorInRoster, loadActiveRoster } from "lib/participants.js";
import { createUploadUrl, deleteFromStorage, imageUrl } from "lib/storage.js";
import type {
  TripDocumentUploadUrlInput,
  TripDocumentCreateInput,
  TripDocumentUpdateInput,
  TripDocumentCategory,
  TripDocumentVisibility,
} from "@birdplan/shared";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENTS_PER_TRIP = 50;

const CATEGORIES: TripDocumentCategory[] = ["flights", "lodging", "transport", "permits", "maps", "other"];
const VISIBILITIES: TripDocumentVisibility[] = ["private", "trip", "public"];

const documents = new Hono();

const requireEditor = async (c: any): Promise<string> => {
  const session = await authenticate(c);
  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const [trip, isEditor] = await Promise.all([Trip.exists({ _id: tripId }), isTripEditor(tripId, session.userId)]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  return session.userId;
};

const validateName = (name: unknown) => {
  if (typeof name !== "string" || !name.trim() || name.length > 200) {
    throw new HTTPException(400, { message: "Invalid file name" });
  }
};

const validateMeta = (name: unknown, size: unknown, mimeType: unknown) => {
  validateName(name);
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    throw new HTTPException(400, { message: "Invalid file size" });
  }
  if (size > MAX_DOCUMENT_BYTES) {
    throw new HTTPException(400, { message: "Files can be up to 10 MB" });
  }
  if (typeof mimeType !== "string" || !/^[\w.+-]+\/[\w.+-]+$/.test(mimeType)) {
    throw new HTTPException(400, { message: "Invalid file type" });
  }
};

const findVisibleDocument = async (tripId: string, documentId: string, userId: string) => {
  const doc = await TripDocument.findOne({ _id: documentId, tripId }).lean();
  if (!doc || (doc.visibility === "private" && doc.uploadedBy !== userId)) {
    throw new HTTPException(404, { message: "Document not found" });
  }
  return doc;
};

documents.get("/", async (c) => {
  const session = await authenticateOptional(c);
  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const [trip, roster] = await Promise.all([Trip.findById(tripId).lean(), loadActiveRoster(tripId)]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });

  const isEditor = isEditorInRoster(roster, session?.userId);
  if (!isEditor && !trip.isPublic) throw new HTTPException(403, { message: "Forbidden" });

  const filter = isEditor
    ? { tripId, $or: [{ visibility: { $ne: "private" } }, { uploadedBy: session?.userId }] }
    : { tripId, visibility: "public" };

  const docs = await TripDocument.find(filter).sort({ createdAt: 1 }).lean();
  return c.json(docs.map((doc) => ({ ...doc, url: imageUrl(doc.key) })));
});

documents.post("/upload-url", async (c) => {
  const tripId = c.req.param("tripId");
  await requireEditor(c);

  const data = await c.req.json<TripDocumentUploadUrlInput>();
  validateMeta(data.name, data.size, data.mimeType);

  const dot = data.name.lastIndexOf(".");
  const base = dot > 0 ? data.name.slice(0, dot) : data.name;
  const ext = dot > 0 ? data.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) : "";
  const safeBase = sanitizeFileName(base).replace(/ /g, "-").toLowerCase() || "file";
  const key = `docs/${tripId}/${nanoId()}/${safeBase}${ext ? `.${ext}` : ""}`;

  const uploadUrl = await createUploadUrl(key, data.mimeType);
  if (!uploadUrl) throw new HTTPException(500, { message: "File storage is not configured" });

  return c.json({ key, uploadUrl });
});

documents.post("/", async (c) => {
  const tripId = c.req.param("tripId");
  const userId = await requireEditor(c);

  const data = await c.req.json<TripDocumentCreateInput>();
  validateMeta(data.name, data.size, data.mimeType);
  if (typeof data.key !== "string" || !data.key.startsWith(`docs/${tripId}/`)) {
    throw new HTTPException(400, { message: "Invalid document key" });
  }

  const count = await TripDocument.countDocuments({ tripId });
  if (count >= MAX_DOCUMENTS_PER_TRIP) {
    throw new HTTPException(400, { message: `Trips can have up to ${MAX_DOCUMENTS_PER_TRIP} documents` });
  }

  const doc = await TripDocument.create({
    tripId,
    name: data.name.trim(),
    key: data.key,
    size: data.size,
    mimeType: data.mimeType,
    uploadedBy: userId,
  });

  return c.json({ ...doc.toObject(), url: imageUrl(doc.key) });
});

documents.patch("/:documentId", async (c) => {
  const tripId = c.req.param("tripId");
  const documentId = c.req.param("documentId");
  const userId = await requireEditor(c);

  const data = await c.req.json<TripDocumentUpdateInput>();
  validateName(data.name);
  const category = data.category || null;
  if (category !== null && !CATEGORIES.includes(category)) {
    throw new HTTPException(400, { message: "Invalid category" });
  }
  if (!VISIBILITIES.includes(data.visibility)) {
    throw new HTTPException(400, { message: "Invalid visibility" });
  }

  await findVisibleDocument(tripId!, documentId, userId);
  const doc = await TripDocument.findOneAndUpdate(
    { _id: documentId, tripId },
    { name: data.name.trim(), category, visibility: data.visibility },
    { new: true }
  ).lean();
  if (!doc) throw new HTTPException(404, { message: "Document not found" });

  return c.json({ ...doc, url: imageUrl(doc.key) });
});

documents.delete("/:documentId", async (c) => {
  const tripId = c.req.param("tripId");
  const documentId = c.req.param("documentId");
  const userId = await requireEditor(c);

  const doc = await findVisibleDocument(tripId!, documentId, userId);

  await TripDocument.deleteOne({ _id: documentId });
  try {
    await deleteFromStorage(doc.key);
  } catch (error) {
    console.error("Failed to delete document from storage", doc.key, error);
  }

  return c.json({});
});

export default documents;
