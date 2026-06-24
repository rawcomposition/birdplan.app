import useMutation from "hooks/useMutation";

export default function useReportNoCode() {
  return useMutation<{ ok: boolean }, { email: string }>({
    url: "/auth/otp-not-received",
    method: "POST",
    showToastError: false,
  });
}
