import { sha256 } from "lib/sha256";

export function gravatarUrl(email: string, size: number): string {
  const hash = sha256(email.trim().toLowerCase());
  return `https://gravatar.com/avatar/${hash}?d=404&s=${size}`;
}
