import React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import clsx from "clsx";
import { gravatarUrl } from "lib/gravatar";
import { AvatarUser } from "lib/avatar";

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-fuchsia-500",
  "bg-orange-500",
];

function colorFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsFor(name?: string | null, email?: string | null) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (words.length > 0) {
    const first = [...words[0]][0] ?? "";
    const last = words.length > 1 ? ([...words[words.length - 1]][0] ?? "") : "";
    return (first + last).toUpperCase();
  }
  return ([...(email?.trim() ?? "")][0] ?? "?").toUpperCase();
}

type Props = {
  user: AvatarUser;
  gravatar?: boolean;
  size?: number;
  className?: string;
};

export default function Avatar({ user, gravatar = true, size = 36, className }: Props) {
  const { seed, name, email, photoUrl } = user;
  const label = name?.trim() || email?.trim() || "?";
  const initials = initialsFor(name, email);
  const color = colorFor((seed || email || name || label).trim().toLowerCase());

  const sources = [
    photoUrl,
    gravatar && email ? gravatarUrl(email, size * 2) : null,
  ].filter((src): src is string => !!src);

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      style={{ width: size, height: size }}
      className={clsx(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        className
      )}
    >
      <AvatarSourceChain key={sources.join("|")} sources={sources} alt={label} />
      <AvatarPrimitive.Fallback
        className={clsx("flex h-full w-full items-center justify-center font-bold text-white", color)}
        style={{ fontSize: Math.round(size * (initials.length > 1 ? 0.36 : 0.4)) }}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

function AvatarSourceChain({ sources, alt }: { sources: string[]; alt: string }) {
  const [index, setIndex] = React.useState(0);
  const src = sources[index];
  if (!src) return null;
  return (
    <AvatarPrimitive.Image
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className="h-full w-full object-cover"
      onLoadingStatusChange={(status) => {
        if (status === "error") setIndex((i) => i + 1);
      }}
    />
  );
}
