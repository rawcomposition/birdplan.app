import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, nanoId, sanitizeFileName } from "lib/utils.js";
import { connect, Trip, TripDocument } from "lib/db.js";
import { isTripEditor } from "lib/participants.js";
import { createUploadUrl, deleteFromStorage, imageUrl } from "lib/storage.js";
import type { TripDocumentUploadUrlInput, TripDocumentCreateInput } from "@birdplan/shared";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENTS_PER_TRIP = 50;

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

const validateMeta = (name: unknown, size: unknown, mimeType: unknown) => {
  if (typeof name !== "string" || !name.trim() || name.length > 200) {
    throw new HTTPException(400, { message: "Invalid file name" });
  }
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

documents.get("/", async (c) => {
  const tripId = c.req.param("tripId");
  await requireEditor(c);

  const docs = await TripDocument.find({ tripId }).sort({ createdAt: 1 }).lean();
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

documents.delete("/:documentId", async (c) => {
  const tripId = c.req.param("tripId");
  const documentId = c.req.param("documentId");
  await requireEditor(c);

  const doc = await TripDocument.findOne({ _id: documentId, tripId }).lean();
  if (!doc) throw new HTTPException(404, { message: "Document not found" });

  await TripDocument.deleteOne({ _id: documentId });
  try {
    await deleteFromStorage(doc.key);
  } catch (error) {
    console.error("Failed to delete document from storage", doc.key, error);
  }

  return c.json({});
});

export default documents;
