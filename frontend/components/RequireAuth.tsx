import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "hooks/useUser";
import Icon from "components/Icon";
import { withReturnTo } from "lib/helpers";

const RequireAuth = () => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={withReturnTo("/login", `${location.pathname}${location.search}`)} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
