import { Outlet } from "react-router-dom";
import Header from "components/Header";
import TripNav from "components/TripNav";
import NotFound from "components/NotFound";
import ErrorBoundary from "components/ErrorBoundary";
import { useTrip } from "hooks/useTrip";

export default function TripLayout() {
  const { is404 } = useTrip();

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full print:h-auto">
      <Header />
      <TripNav />
      <main className="flex flex-1 min-h-0 relative bg-background print:min-h-0 print:block">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
