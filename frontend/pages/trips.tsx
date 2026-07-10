import { Link } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { TripListPage, TripStats } from "@birdplan/shared";
import Header from "components/Header";
import Footer from "components/Footer";
import { Button } from "components/ui/button";
import Notice from "components/Notice";
import EmptyState from "components/EmptyState";
import LoadingState from "components/LoadingState";
import { Card } from "components/ui/card";
import TripCard from "components/TripCard";
import WidgetHeader from "components/WidgetHeader";
import { useUser } from "hooks/useUser";
import { get } from "lib/http";
import news from "data/news.json";

const greeting = () => {
  const hour = dayjs().hour();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const recentNews = news.filter((item) => dayjs().diff(dayjs(item.date), "day") < 60);

export default function Trips() {
  const { user, lifelist } = useUser();

  const { data, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<TripListPage>({
      queryKey: ["/trips"],
      enabled: !!user?._id,
      initialPageParam: null as string | null,
      queryFn: ({ pageParam }) =>
        get(`${import.meta.env.VITE_API_URL}/trips`, pageParam ? { cursor: pageParam as string } : {}),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  const {
    data: stats,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery<TripStats>({
    queryKey: ["/trips/stats"],
    enabled: !!user?._id,
  });

  const trips = data?.pages.flatMap((page) => page.trips) ?? [];
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const statRows = [
    { label: "Trips", value: stats?.tripCount },
    { label: "Hotspots saved", value: stats?.hotspotTotal },
    { label: "Countries", value: stats?.countryCount },
  ];

  return (
    <div className="flex h-full flex-col">
      <title>My Trips | BirdPlan.app</title>

      <Header border />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 md:px-7">
        <div className="mt-6 mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {greeting()}
              {firstName && `, ${firstName}`}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              <span className="sm:hidden">Trips</span>
              <span className="hidden sm:inline">Your birding trips</span>
            </h1>
          </div>
          <Button variant="default" href="/create" className="shrink-0 pr-6 items-center">
            <span className="text-xl font-bold leading-4">+</span>Create Trip
          </Button>
        </div>

        <Notice />

        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
            {error ? (
              <EmptyState variant="destructive" title="Error loading trips" onRetry={() => refetch()} />
            ) : isLoading ? (
              <LoadingState />
            ) : trips.length === 0 ? (
              <p className="text-lg text-muted-foreground">
                You don&apos;t have any trips yet.{" "}
                <Link className="font-bold text-link" to="/create">
                  Create one!
                </Link>
              </p>
            ) : (
              <>
                {trips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} />
                ))}

                {hasNextPage && (
                  <Button
                    variant="outline"
                    className="mt-2 self-center"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                )}
              </>
            )}
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-[340px]">
            <Card className="px-5 py-4">
              <WidgetHeader title="My stats" />
              {statsError ? (
                <EmptyState
                  inline
                  variant="destructive"
                  className="mx-0 mt-3"
                  title="Failed to load stats"
                  onRetry={() => refetchStats()}
                />
              ) : (
                statRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between border-b border-border/40 py-3 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-xl font-bold text-foreground">
                      {value == null ? "-" : value.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </Card>

            <Card className="px-5 py-4">
              <WidgetHeader title="World life list" action={{ label: "Manage", to: "/import-lifelist" }} />
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-primary tabular-nums">
                  {lifelist.length.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">species</span>
              </div>
              {user?.lifelistUpdatedAt && (
                <p className="mt-2 text-xs text-muted-foreground">Updated {dayjs(user.lifelistUpdatedAt).fromNow()}</p>
              )}
            </Card>

            {recentNews.length > 0 && (
              <Card className="px-5 py-4">
                <WidgetHeader title="What's new" action={{ label: "All updates", to: "/whats-new" }} />
                <div className="flex flex-col divide-y divide-border/60">
                  {recentNews.map(({ date, title, description }) => (
                    <div key={title} className="py-4 last:pb-1">
                      <p className="text-[11px] font-bold tracking-wide text-success uppercase">
                        {dayjs(date).format("MMM D, YYYY")}
                      </p>
                      <h3 className="mt-1.5 text-sm font-bold text-foreground">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
