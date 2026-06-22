import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import clsx from "clsx";
import { AdminDashboard, AdminDashboardUser } from "@birdplan/shared";
import Header from "components/Header";
import Footer from "components/Footer";
import LoginModal from "components/LoginModal";
import Icon from "components/Icon";
import Avatar from "components/Avatar";
import Card from "components/Card";
import Error from "components/Error";
import { avatarFromProfile } from "lib/avatar";
import { useUser } from "providers/user";
import { useProfile } from "providers/profile";

dayjs.extend(relativeTime);

const providerLabels: Record<string, string> = {
  password: "Email",
  "google.com": "Google",
  "apple.com": "Apple",
};

const providerColors: Record<string, string> = {
  password: "bg-gray-100 text-gray-600",
  "google.com": "bg-red-50 text-red-600",
  "apple.com": "bg-gray-800 text-white",
};

type SortKey = "lastActiveAt" | "createdAt";

const formatDate = (value: string | Date | null) => {
  if (!value) return "—";
  const date = dayjs(value);
  if (!date.isValid()) return "—";
  return `${date.format("MMM D, YYYY")} · ${date.fromNow()}`;
};

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
        className={clsx("inline-flex items-center gap-1 hover:text-gray-800", isActive ? "text-gray-800" : "text-gray-500")}
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive && <Icon name="angleDownBold" className={clsx("text-[10px]", dir === "asc" && "rotate-180")} />}
      </button>
    </th>
  );
}

function ProviderBadges({ providers }: { providers: string[] }) {
  if (!providers.length) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {providers.map((provider) => (
        <span
          key={provider}
          className={clsx(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
            providerColors[provider] || "bg-gray-100 text-gray-600"
          )}
        >
          {providerLabels[provider] || provider}
        </span>
      ))}
    </div>
  );
}

export default function Admin() {
  const { user, loading } = useUser();
  const profile = useProfile();
  const [sortKey, setSortKey] = React.useState<SortKey>("lastActiveAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading, error } = useQuery<AdminDashboard>({
    queryKey: ["/admin"],
    enabled: !!profile.isAdmin,
  });

  if (loading) return null;
  if (!user) return <LoginModal showLoader={false} />;
  if (!profile.uid) return null;
  if (!profile.isAdmin) return <Navigate to="/" replace />;

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

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">User</th>
                        <th className="px-4 py-3 text-left font-medium">Sign-in</th>
                        <SortHeader
                          label="Last active"
                          sortKey="lastActiveAt"
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar user={avatarFromProfile(u)} size={32} />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 truncate">{u.name || "Unnamed"}</p>
                                {u.email && <p className="text-gray-500 truncate">{u.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <ProviderBadges providers={u.providers} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(u.lastActiveAt)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
