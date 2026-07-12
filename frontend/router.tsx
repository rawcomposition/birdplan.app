import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "RootLayout";
import Home from "pages/index";
import Login from "pages/login";
import Signup from "pages/signup";
import Contact from "pages/contact";
import Support from "pages/support";
import Trips from "pages/trips";
import Account from "pages/account";
import Create from "pages/create";
import WhatsNew from "pages/whats-new";
import Privacy from "pages/privacy";
import Onboarding from "pages/onboarding";
import ImportLifelist from "pages/import-lifelist";
import Accept from "pages/accept/[inviteId]";
import Magic from "pages/magic/[token]";
import TripMap from "pages/[tripId]/index";
import TripSettings from "pages/[tripId]/settings";
import TripTargets from "pages/[tripId]/targets";
import TripSpecies from "pages/[tripId]/targets/[speciesCode]";
import TripItinerary from "pages/[tripId]/itinerary";
import TripParticipants from "pages/[tripId]/participants";
import TripLifelist from "pages/[tripId]/lifelist";
import NotFound from "components/NotFound";
import RequireAuth from "components/RequireAuth";
import TripLayout from "components/TripLayout";

const Admin = lazy(() => import("pages/admin"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/contact", element: <Contact /> },
      { path: "/support", element: <Support /> },
      { path: "/whats-new", element: <WhatsNew /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/onboarding", element: <Onboarding /> },
      { path: "/accept/:inviteId", element: <Accept /> },
      { path: "/magic/:token", element: <Magic /> },
      {
        path: "/:tripId",
        element: <TripLayout />,
        children: [
          { index: true, element: <TripMap /> },
          { path: "targets", element: <TripTargets /> },
          { path: "targets/:speciesCode", element: <TripSpecies /> },
          { path: "itinerary", element: <TripItinerary /> },
        ],
      },
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
