import { toast } from "react-hot-toast";
import { auth } from "lib/firebase";

type Params = {
  [key: string]: string | number | boolean;
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
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(urlWithParams, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
  });
  if (showLoading) toast.dismiss(url);

  let json: any = {};

  try {
    json = await res.json();
  } catch (error) {}
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 403) throw new Error("Forbidden");
    if (res.status === 404) throw new Error("Route not found");
    if (res.status === 405) throw new Error("Method not allowed");
    if (res.status === 504) throw new Error("Operation timed out. Please try again.");
    throw new Error(json.message || "An error occurred");
  }
  return json;
};

export const mutate = async (method: "POST" | "PUT" | "DELETE" | "PATCH", url: string, data?: any) => {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(url, {
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
  } catch (error) {}

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 403) throw new Error("Forbidden");
    if (res.status === 404) throw new Error("Route not found");
    if (res.status === 405) throw new Error("Method not allowed");
    if (res.status === 504) throw new Error("Operation timed out. Please try again.");
    throw new Error((json as any)?.message || (json as any)?.error || "An error occurred");
  }

  return json;
};
