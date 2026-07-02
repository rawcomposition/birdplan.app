import { Outlet } from "react-router-dom";
import Header from "components/Header";
import TripNav from "components/TripNav";
import NotFound from "components/NotFound";
import ErrorBoundary from "components/ErrorBoundary";
import { useTrip } from "hooks/useTrip";
import { useUser } from "hooks/useUser";

export default function TripLayout() {
  const { trip, is404 } = useTrip();
  const { user } = useUser();

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?._id ? "/trips" : "/" }} />
      <TripNav />
      <main className="flex flex-1 min-h-0 relative bg-background">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
