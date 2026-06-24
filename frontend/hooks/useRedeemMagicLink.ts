import { useQueryClient } from "@tanstack/react-query";
import { RedeemMagicLinkResponse } from "@birdplan/shared";
import useMutation from "hooks/useMutation";
import { setSessionToken } from "lib/sessionToken";

export default function useRedeemMagicLink() {
  const queryClient = useQueryClient();

  return useMutation<RedeemMagicLinkResponse, { token: string }>({
    url: "/auth/redeem-magic-link",
    method: "POST",
    showToastError: false,
    onSuccess: async (data) => {
      setSessionToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });
}
