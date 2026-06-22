import React from "react";

const TOKEN_KEY = "bp_session";

const listeners = new Set<() => void>();
let current: string | null = typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export const getSessionToken = () => current;

export const setSessionToken = (token: string | null) => {
  current = token;
  if (typeof localStorage !== "undefined") {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }
  listeners.forEach((listener) => listener());
};

export const clearSessionToken = () => setSessionToken(null);

export const clearSessionTokenStorage = () => {
  current = null;
  if (typeof localStorage !== "undefined") localStorage.removeItem(TOKEN_KEY);
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const useSessionToken = () => React.useSyncExternalStore(subscribe, getSessionToken, () => null);
