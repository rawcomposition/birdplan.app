import { toast } from "react-hot-toast";
import { getSessionToken } from "lib/sessionToken";

type Params = {
  [key: string]: string | number | boolean;
};

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

export const get = async (url: string, params: Params, showLoading?: boolean) => {
  const cleanParams = Object.keys(params).reduce((accumulator: any, key) => {
    if (params[key]) accumulator[key] = params[key];
    return accumulator;
  }, {});

  const queryParams = new URLSearchParams(cleanParams).toString();

  let urlWithParams = url;
  if (queryParams) {
    urlWithParams += url.includes("?") ? `&${queryParams}` : `?${queryParams}`;
  }

  if (showLoading) toast.loading("Loading...", { id: url });
  const isBackend = urlWithParams.startsWith(import.meta.env.VITE_API_URL);
  const token = isBackend ? getSessionToken() : undefined;
  const res = await fetch(urlWithParams, {
    method: "GET",
    headers: isBackend ? { Authorization: `Bearer ${token || ""}` } : undefined,
  });
  if (showLoading) toast.dismiss(url);

  let json: any = {};

  try {
    json = await res.json();
  } catch {}
  if (!res.ok) {
    if (res.status === 401) {
      if (isBackend) onUnauthorized?.();
      throw new HttpError(401, "Unauthorized");
    }
    if (res.status === 403) throw new HttpError(403, "Forbidden");
    if (res.status === 404)
      throw new HttpError(404, json.message && json.message !== "Not Found" ? json.message : "Route not found");
    if (res.status === 405) throw new HttpError(405, "Method not allowed");
    if (res.status === 504) throw new HttpError(504, "Operation timed out. Please try again.");
    throw new HttpError(res.status, json.message || "An error occurred");
  }
  return json;
};

export const mutate = async (method: "POST" | "PUT" | "DELETE" | "PATCH", url: string, data?: any) => {
  const token = getSessionToken();
  const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;
  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(data),
  });

  let json: any | null = null;
  try {
    json = await res.json();
  } catch {}

  if (!res.ok) {
    if (res.status === 401) {
      onUnauthorized?.();
      throw new HttpError(401, "Unauthorized");
    }
    if (res.status === 403) throw new HttpError(403, "Forbidden");
    if (res.status === 404)
      throw new HttpError(404, json?.message && json.message !== "Not Found" ? json.message : "Route not found");
    if (res.status === 405) throw new HttpError(405, "Method not allowed");
    if (res.status === 504) throw new HttpError(504, "Operation timed out. Please try again.");
    throw new HttpError(res.status, (json as any)?.message || (json as any)?.error || "An error occurred");
  }

  return json;
};
