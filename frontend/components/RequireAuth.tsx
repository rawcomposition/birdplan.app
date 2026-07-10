import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "hooks/useUser";
import LoadingState from "components/LoadingState";
import { withReturnTo } from "lib/helpers";

const RequireAuth = () => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <LoadingState className="h-full" />;
  }

  if (!user) {
    return <Navigate to={withReturnTo("/login", `${location.pathname}${location.search}`)} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
