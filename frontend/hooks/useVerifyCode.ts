import { useQueryClient } from "@tanstack/react-query";
import useMutation from "hooks/useMutation";
import { setSessionToken } from "lib/sessionToken";

export type VerifyCodeResponse = { token: string; isNewUser: boolean };
export type VerifyCodeInput = { email: string; code: string };

export default function useVerifyCode() {
  const queryClient = useQueryClient();

  return useMutation<VerifyCodeResponse, VerifyCodeInput>({
    url: "/auth/verify-code",
    method: "POST",
    showToastError: false,
    onSuccess: async (data) => {
      setSessionToken(data.token);
      await queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });
}
