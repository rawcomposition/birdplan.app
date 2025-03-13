import Link from "next/link";
import CloseButton from "components/CloseButton";
import { useProfile } from "providers/profile";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Profile } from "lib/types";

const noticeId = "";

export default function Notice() {
  const { _id, dismissedNoticeId } = useProfile();
  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    url: "/api/my-profile",
    method: "PATCH",
    onMutate: async (data: any) => {
      await queryClient.cancelQueries({ queryKey: [`/api/my-profile`] });
      const prevData = queryClient.getQueryData([`/api/my-profile`]);

      queryClient.setQueryData<Profile | undefined>([`/api/my-profile`], (old) => {
        if (!old) return old;
        return { ...old, dismissedNoticeId: data.dismissedNoticeId };
      });

      return { prevData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/my-profile`] });
    },
  });

  if (!noticeId) return null;
  if (!_id) return null;
  if (dismissedNoticeId === noticeId) return null;

  return (
    <div className="bg-white border-l-4 border-blue-500 p-4 mb-8">
      <div className="flex items-start justify-between gap-4">
        <p className="text-gray-700">
          <span className="font-bold">Heads up!</span> The eBird taxonomy was recently updated.
          <br />
          Be sure to{" "}
          <Link href="/import-lifelist" className="text-blue-600 font-bold">
            re-import your life list
          </Link>{" "}
          and targets for any upcoming trips.
        </p>
        <CloseButton onClick={() => dismissMutation.mutate({ dismissedNoticeId: noticeId })} />
      </div>
    </div>
  );
}
