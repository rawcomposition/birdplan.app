import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "hooks/useUser";
import { Spinner } from "components/ui/spinner";
import { withReturnTo } from "lib/helpers";

const RequireAuth = () => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Spinner className="size-9 text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={withReturnTo("/login", `${location.pathname}${location.search}`)} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
