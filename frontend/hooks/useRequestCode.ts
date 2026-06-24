import useMutation from "hooks/useMutation";

export default function useRequestCode() {
  return useMutation<{ ok: boolean }, { email: string }>({
    url: "/auth/request-code",
    method: "POST",
    showToastError: false,
  });
}
