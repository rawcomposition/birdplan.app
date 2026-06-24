import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import clsx from "clsx";
import { CopyIcon, CheckIcon } from "lucide-react";
import { AdminDashboard, AdminDashboardUser, AdminDashboardLog, GenerateMagicLinkResponse } from "@birdplan/shared";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Avatar from "components/Avatar";
import Card from "components/Card";
import Error from "components/Error";
import Button from "components/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { mutate } from "lib/http";
import { avatarFromUser } from "lib/avatar";
import { useUser } from "hooks/useUser";

dayjs.extend(relativeTime);

type SortKey = "lastActiveAt" | "lastAuthenticatedAt" | "createdAt";

const formatDate = (value: string | Date | null) => {
  if (!value) return "—";
  const date = dayjs(value);
  if (!date.isValid()) return "—";
  return `${date.format("MMM D, YYYY")} · ${date.fromNow()}`;
};

function LogRow({ log }: { log: AdminDashboardLog }) {
  const ip = log.ip === "unknown" ? "IP Unknown" : log.ip;
  const detail = [log.email, log.userId, ip].filter(Boolean).join(" · ");
  const data = log.data && Object.keys(log.data).length > 0 ? JSON.stringify(log.data) : null;
  return (
    <tr className="hover:bg-gray-50 align-top">
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">{log.type}</span>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {detail && <p className="truncate">{detail}</p>}
        {data && <p className="font-mono text-xs text-gray-400 break-all">{data}</p>}
        {!detail && !data && <span className="text-gray-400">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(log.createdAt)}</td>
    </tr>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const isActive = activeKey === sortKey;
  return (
    <th className="px-4 py-3 text-left font-medium">
      <button
        className={clsx(
          "inline-flex items-center gap-1 hover:text-gray-800",
          isActive ? "text-gray-800" : "text-gray-500"
        )}
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive && <Icon name="angleDownBold" className={clsx("text-[10px]", dir === "asc" && "rotate-180")} />}
      </button>
    </th>
  );
}

function CopyLinkField({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);

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
      <Button color="primary" size="sm" onClick={copy} className="flex items-center gap-1.5 whitespace-nowrap">
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function MagicLinkDetails({ link }: { link: GenerateMagicLinkResponse }) {
  return (
    <div className="space-y-3">
      {link.isNewUser && (
        <p className="text-sm text-gray-600">
          A new account was created for <span className="font-medium">{link.email}</span>.
        </p>
      )}
      <CopyLinkField key={link.url} url={link.url} />
      <p className="text-xs text-gray-500">Single-use · expires {dayjs(link.expiresAt).fromNow()}</p>
    </div>
  );
}

function UserActions({ user }: { user: AdminDashboardUser }) {
  const [link, setLink] = React.useState<GenerateMagicLinkResponse | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await mutate("POST", `/admin/users/${user._id}/magic-link`);
      setLink(res as GenerateMagicLinkResponse);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate link");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          disabled={generating}
          aria-label="User actions"
        >
          <Icon name={generating ? "loading" : "verticalDots"} className={clsx(generating && "animate-spin")} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={generate}>Generate magic link</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!link} onOpenChange={(open) => !open && setLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Magic sign-in link</DialogTitle>
            <DialogDescription>Send this link to {user.email || "the user"}.</DialogDescription>
          </DialogHeader>
          {link && <MagicLinkDetails link={link} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function NewUserMagicLink() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [link, setLink] = React.useState<GenerateMagicLinkResponse | null>(null);

  const reset = () => {
    setEmail("");
    setLink(null);
    setGenerating(false);
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.trim().toLowerCase();
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
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button color="primary" size="sm">
            Generate magic link
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate magic link</DialogTitle>
          <DialogDescription>
            Enter an email to create a sign-in link. If no account exists, one is created.
          </DialogDescription>
        </DialogHeader>
        {link ? (
          <MagicLinkDetails link={link} />
        ) : (
          <form onSubmit={generate} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm"
            />
            <Button type="submit" color="primary" size="sm" disabled={generating || !email.trim()} className="w-full">
              {generating ? <Icon name="loading" className="animate-spin" /> : "Generate link"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Admin() {
  const { user, loading } = useUser();
  const [tab, setTab] = React.useState<"users" | "logs">("users");
  const [sortKey, setSortKey] = React.useState<SortKey>("lastActiveAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = useQuery<AdminDashboard>({
    queryKey: ["/admin"],
    enabled: !!user?.isAdmin,
  });

  if (loading) return null;
  if (!user) return null;
  if (!user.isAdmin) return <Navigate to="/" replace />;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedUsers: AdminDashboardUser[] = [...(data?.users || [])].sort((a, b) => {
    const aTime = a[sortKey] ? dayjs(a[sortKey]).valueOf() : 0;
    const bTime = b[sortKey] ? dayjs(b[sortKey]).valueOf() : 0;
    return sortDir === "asc" ? aTime - bTime : bTime - aTime;
  });

  return (
    <div className="flex flex-col h-full">
      <title>Admin | BirdPlan.app</title>

      <Header />
      <main className="max-w-6xl w-full mx-auto px-4 lg:px-0 pb-12">
        <h1 className="text-3xl font-bold text-gray-700 mb-8 mt-6">
          <Icon name="user" className="text-2xl text-gray-600" /> Admin Dashboard
        </h1>

        {error && <Error message={error.message} />}

        {isLoading && !data ? (
          <div className="flex justify-center py-16">
            <Icon name="loading" className="animate-spin text-4xl text-slate-400" />
          </div>
        ) : (
          data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card className="p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Users</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <Stat label="Total" value={data.stats.users.total} />
                    <Stat label="Active 30 days" value={data.stats.users.active30d} />
                    <Stat label="Active 6 months" value={data.stats.users.active6mo} />
                  </div>
                </Card>
                <Card className="p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Trips</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <Stat label="Total" value={data.stats.trips.total} />
                    <Stat label="Created 30 days" value={data.stats.trips.created30d} />
                    <Stat label="Created 6 months" value={data.stats.trips.created6mo} />
                  </div>
                </Card>
              </div>

              <div className="mb-4 flex gap-1 border-b border-gray-200">
                {(["users", "logs"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={clsx(
                      "-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize",
                      tab === key
                        ? "border-gray-800 text-gray-800"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {tab === "users" && (
                <>
                  <div className="mb-3 flex justify-end">
                    <NewUserMagicLink />
                  </div>
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">User</th>
                            <SortHeader
                              label="Last active"
                              sortKey="lastActiveAt"
                              activeKey={sortKey}
                              dir={sortDir}
                              onSort={handleSort}
                            />
                            <SortHeader
                              label="Last login"
                              sortKey="lastAuthenticatedAt"
                              activeKey={sortKey}
                              dir={sortDir}
                              onSort={handleSort}
                            />
                            <SortHeader
                              label="Created"
                              sortKey="createdAt"
                              activeKey={sortKey}
                              dir={sortDir}
                              onSort={handleSort}
                            />
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sortedUsers.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar user={avatarFromUser(u)} size={32} />
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{u.name || "Unnamed"}</p>
                                    {u.email && <p className="text-gray-500 truncate">{u.email}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                {formatDate(u.lastActiveAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                {formatDate(u.lastAuthenticatedAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(u.createdAt)}</td>
                              <td className="px-4 py-3 text-right">
                                <UserActions user={u} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}

              {tab === "logs" && (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Type</th>
                          <th className="px-4 py-3 text-left font-medium">Details</th>
                          <th className="px-4 py-3 text-left font-medium">When</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(data.logs || []).map((log) => (
                          <LogRow key={log._id} log={log} />
                        ))}
                        {(data.logs || []).length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                              No logs yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
