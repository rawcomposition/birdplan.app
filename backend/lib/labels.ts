import { HTTPException } from "hono/http-exception";
import { LABEL_COLORS } from "@birdplan/shared";
import type { LabelInput, LabelColor } from "@birdplan/shared";

export const parseLabelInput = (data: LabelInput) => {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) throw new HTTPException(400, { message: "Name is required" });
  if (name.length > 50) throw new HTTPException(400, { message: "Name is too long" });
  if (!LABEL_COLORS.includes(data.color as LabelColor)) throw new HTTPException(400, { message: "Color is required" });
  return { name, color: data.color };
};
