import React from "react";
import toast from "react-hot-toast";
import { useUser } from "hooks/useUser";
import { useSearchParams } from "react-router-dom";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import DashboardPage from "components/DashboardPage";
import LifelistUpload from "components/LifelistUpload";
import Icon from "components/Icon";
import { EBIRD_WORLD_LIFELIST_URL } from "components/EbirdDownloadLink";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { getReturnLabel } from "lib/helpers";
import ExceptionsEditor from "components/ExceptionsEditor";

export default function ImportLifelist() {
  const { user, lifelist } = useUser();
  const lifelistUpdatedAt = user?.lifelistUpdatedAt;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const tripId = searchParams.get("tripId");
  const returnTo = searchParams.get("returnTo");
  const onboarding = searchParams.get("onboarding");
  const returnToStr = returnTo || (tripId ? `/${tripId}` : null);
  const redirectUrl = returnToStr || `/trips`;
  const backLabel = getReturnLabel(returnToStr);
  const isOnboarding = onboarding === "1";
  const hasList = !!lifelist?.length;

  const importMutation = useMutation({
    url: `/profile/lifelist`,
    method: "PUT",
    onSuccess: () => {
      toast.success("Life list imported");
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });

  return (
    <DashboardPage
      title="World life list"
      icon="feather"
      iconClassName="text-success"
      documentTitle="World Life List | BirdPlan.app"
      back={isOnboarding ? undefined : { to: redirectUrl, label: `Back to ${backLabel}` }}
      maxWidth="6xl"
    >
      {hasList && (
        <Card className="rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Species on your list
              </p>
              <p className="text-3xl font-bold text-foreground tabular-nums">{lifelist.length.toLocaleString()}</p>
            </div>
            {lifelistUpdatedAt && (
              <div className="text-right">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Last updated</p>
                <p className="text-sm text-secondary-foreground">{new Date(lifelistUpdatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-5 mb-6">
        <h3 className="mb-4 text-lg font-medium text-secondary-foreground">
          {hasList ? "Update your list" : "Import your list"}
        </h3>
        <ol className="space-y-5">
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-link">
              1
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-foreground">Download your life list from eBird</p>
              <p className="mb-2.5 text-xs text-muted-foreground">
                Sign in if prompted. The CSV will download automatically.
              </p>
              <Button
                href={EBIRD_WORLD_LIFELIST_URL}
                target="_blank"
                rel="noreferrer"
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <Icon name="download" />
                Download from eBird
              </Button>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-link">
              2
            </span>
            <div className="flex-1">
              <p className="mb-2.5 text-sm font-medium text-secondary-foreground">
                Upload the CSV file you just downloaded
              </p>
              <LifelistUpload
                onImport={(sciNames) => importMutation.mutate({ sciNames })}
                isPending={importMutation.isPending}
                world
              />
            </div>
          </li>
        </ol>
      </Card>

      <Card className="p-5 mb-6"><ExceptionsEditor /></Card>

      <div className="flex">
        <Button
          href={redirectUrl}
          variant={isOnboarding ? "default" : "outline"}
          size="lg"
          className="ml-auto inline-flex items-center"
        >
          {isOnboarding ? "Continue" : "Done"}
        </Button>
      </div>
    </DashboardPage>
  );
}
