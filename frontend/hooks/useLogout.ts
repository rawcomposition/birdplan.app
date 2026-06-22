import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { teardownSession } from "lib/logout";

export default function useLogout() {
  const [loading, setLoading] = React.useState(false);
  const queryClient = useQueryClient();

  const logout = async () => {
    setLoading(true);
    try {
      await mutate("POST", "/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      await teardownSession(queryClient);
      window.location.href = "/";
    }
  };

  return { logout, loading };
}
