import { Link, useLocation } from "react-router-dom";
import { Button } from "components/ui/button";
import { XIcon } from "lucide-react";
import { useUser } from "hooks/useUser";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@birdplan/shared";
import { withReturnTo } from "lib/helpers";

const noticeId = "";

export default function Notice() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const location = useLocation();
  const asPath = `${location.pathname}${location.search}`;

  const dismissMutation = useMutation({
    url: "/profile",
    method: "PATCH",
    onMutate: async (data: any) => {
      await queryClient.cancelQueries({ queryKey: ["/auth/me"] });
      const prevData = queryClient.getQueryData(["/auth/me"]);

      queryClient.setQueryData<User | undefined>(["/auth/me"], (old) => {
        if (!old) return old;
        return { ...old, dismissedNoticeId: data.dismissedNoticeId };
      });

      return { prevData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });

  if (!noticeId) return null;
  if (!user?._id) return null;
  if (user.dismissedNoticeId === noticeId) return null;

  return (
    <div className="bg-white border-l-4 border-primary p-4 mb-8">
      <div className="flex items-start justify-between gap-4">
        <p className="text-gray-700">
          <span className="font-bold">Heads up!</span> The eBird taxonomy was recently updated.
          <br />
          Be sure to{" "}
          <Link to={withReturnTo("/import-lifelist", asPath)} className="text-link font-bold">
            re-import your life list
          </Link>{" "}
          and targets for any upcoming trips.
        </p>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => dismissMutation.mutate({ dismissedNoticeId: noticeId })}
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
