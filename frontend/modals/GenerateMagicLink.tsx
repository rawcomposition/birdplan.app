import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import { CopyIcon, CheckIcon } from "lucide-react";
import { GenerateMagicLinkResponse } from "@birdplan/shared";
import { Header, Body } from "components/Modal";
import { mutate } from "lib/http";
import { Button } from "components/ui/button";

dayjs.extend(relativeTime);

function CopyLinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1 rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-mono text-xs text-gray-700"
      />
      <Button variant="default" size="sm" onClick={copy} className="flex items-center gap-1.5 whitespace-nowrap">
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function MagicLinkDetails({ link, email }: { link: GenerateMagicLinkResponse; email?: string }) {
  return (
    <div className="space-y-3 pb-2">
      {link.isNewUser ? (
        <p className="text-sm text-gray-600">
          A new account was created for <span className="font-medium">{link.email}</span>.
        </p>
      ) : (
        <p className="text-sm text-gray-600">Send this link to {email || "the user"}.</p>
      )}
      <CopyLinkField key={link.url} url={link.url} />
      <p className="text-xs text-gray-500">Single-use · expires {dayjs(link.expiresAt).fromNow()}</p>
    </div>
  );
}

type Props = { link?: GenerateMagicLinkResponse; email?: string };

export default function GenerateMagicLink({ link: initialLink, email }: Props) {
  const [input, setInput] = useState(email ?? "");
  const [generating, setGenerating] = useState(false);
  const [link, setLink] = useState<GenerateMagicLinkResponse | null>(initialLink ?? null);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = input.trim().toLowerCase();
    if (!target) return;
    setGenerating(true);
    try {
      const res = await mutate("POST", "/admin/magic-link", { email: target });
      setLink(res as GenerateMagicLinkResponse);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate link");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Header>{link ? "Magic sign-in link" : "Generate magic link"}</Header>
      <Body className="pb-6">
        {link ? (
          <MagicLinkDetails link={link} email={email} />
        ) : (
          <form onSubmit={generate} className="space-y-3 pb-2">
            <p className="text-sm text-gray-600">
              Enter an email to create a sign-in link. If no account exists, one is created.
            </p>
            <input
              type="email"
              required
              autoFocus
              placeholder="name@example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm"
            />
            <Button
              variant="default"
              size="sm"
              type="submit"
              loading={generating}
              disabled={!input.trim()}
              className="w-full"
            >
              Generate link
            </Button>
          </form>
        )}
      </Body>
    </>
  );
}
