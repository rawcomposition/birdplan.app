import React from "react";
import { mutate } from "lib/http";
import { teardownSessionForReload } from "lib/logout";

export default function useLogout() {
  const [loading, setLoading] = React.useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await mutate("POST", "/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      await teardownSessionForReload();
      window.location.href = "/";
    }
  };

  return { logout, loading };
}
