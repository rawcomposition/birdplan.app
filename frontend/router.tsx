import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "RootLayout";
import Home from "pages/index";
import Login from "pages/login";
import Signup from "pages/signup";
import Support from "pages/support";
import Trips from "pages/trips";
import Account from "pages/account";
import Create from "pages/create";
import WhatsNew from "pages/whats-new";
import Onboarding from "pages/onboarding";
import MyRarestLifers from "pages/my-rarest-lifers";
import ImportLifelist from "pages/import-lifelist";
import Accept from "pages/accept/[inviteId]";
import TripIndex from "pages/[tripId]/index";
import TripSettings from "pages/[tripId]/settings";
import TripTargets from "pages/[tripId]/targets";
import TripSpecies from "pages/[tripId]/targets/[speciesCode]";
import TripItinerary from "pages/[tripId]/itinerary";
import TripParticipants from "pages/[tripId]/participants";
import TripLifelist from "pages/[tripId]/lifelist";
import NotFound from "components/NotFound";
import RequireAuth from "components/RequireAuth";

const Admin = lazy(() => import("pages/admin"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/support", element: <Support /> },
      { path: "/whats-new", element: <WhatsNew /> },
      { path: "/onboarding", element: <Onboarding /> },
      { path: "/my-rarest-lifers", element: <MyRarestLifers /> },
      { path: "/accept/:inviteId", element: <Accept /> },
      { path: "/:tripId", element: <TripIndex /> },
      { path: "/:tripId/targets", element: <TripTargets /> },
      { path: "/:tripId/targets/:speciesCode", element: <TripSpecies /> },
      { path: "/:tripId/itinerary", element: <TripItinerary /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "/trips", element: <Trips /> },
          { path: "/account", element: <Account /> },
          { path: "/create", element: <Create /> },
          { path: "/import-lifelist", element: <ImportLifelist /> },
          {
            path: "/admin",
            element: (
              <Suspense fallback={null}>
                <Admin />
              </Suspense>
            ),
          },
          { path: "/:tripId/settings", element: <TripSettings /> },
          { path: "/:tripId/participants", element: <TripParticipants /> },
          { path: "/:tripId/lifelist", element: <TripLifelist /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
