import React from "react";
import toast from "react-hot-toast";
import { useProfile } from "hooks/useProfile";
import { useSearchParams } from "react-router-dom";
import Header from "components/Header";
import Button from "components/Button";
import Card from "components/Card";
import Footer from "components/Footer";
import Icon from "components/Icon";
import LifelistUpload from "components/LifelistUpload";
import EbirdDownloadLink from "components/EbirdDownloadLink";
import { Link } from "react-router-dom";
import useMutation from "hooks/useMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncSelect from "components/ReactSelectAsyncStyled";
import { Option } from "lib/types";
import { getReturnLabel } from "lib/helpers";
import Alert from "components/Alert";

export default function ImportLifelist() {
  const [exceptionsValue, setExceptionsValue] = React.useState<Option[]>([]);
  const [seededKey, setSeededKey] = React.useState<string | null>(null);
  const { lifelist, lifelistUpdatedAt, exceptions } = useProfile();
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

  const exceptionsString = exceptions?.join(",");

  const setExceptionsMutation = useMutation({
    url: "/profile",
    method: "PATCH",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });

  const importMutation = useMutation({
    url: `/profile/lifelist`,
    method: "PUT",
    onSuccess: () => {
      toast.success("Life list imported");
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });

  const {
    data: taxonomy,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ name: string; code: string }[]>({
    queryKey: ["/taxonomy"],
  });

  const seedKey = `${exceptionsString || ""}|${taxonomy ? "1" : "0"}`;
  if (exceptionsString && seedKey !== seededKey) {
    setSeededKey(seedKey);
    setExceptionsValue(
      exceptionsString.split(",").map((code) => {
        const taxon = taxonomy?.find((it) => it.code === code);
        return {
          label: taxon?.name || `Unknown (${code})`,
          value: taxon?.code ?? code,
        };
      })
    );
  }

  const taxonomySearch = (input: string, callback: (options: Option[]) => void) => {
    const options = taxonomy?.filter((it) => it.name.toLowerCase().includes(input.toLowerCase()))?.slice(0, 25) || [];
    const formattedOptions = options.map((it) => ({ value: it.code, label: it.name }));
    callback(formattedOptions);
  };

  return (
    <div className="flex flex-col h-full">
        <title>World Life List | BirdPlan.app</title>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {!isOnboarding && (
          <Link
            to={redirectUrl}
            className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
          >
            ← Back to {backLabel}
          </Link>
        )}
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Icon name="feather" className="text-2xl text-lime-600" /> World Life List
          </h1>

          {hasList && (
            <Card className="p-5 mb-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Species on your list</p>
                  <p className="text-3xl font-bold text-gray-800 tabular-nums">{lifelist.length.toLocaleString()}</p>
                </div>
                {lifelistUpdatedAt && (
                  <div className="text-right">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Last updated</p>
                    <p className="text-sm text-gray-700">{new Date(lifelistUpdatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="p-5 mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-medium text-gray-700">{hasList ? "Update your list" : "Import your list"}</h3>
              <EbirdDownloadLink className="shrink-0" world />
            </div>
            <LifelistUpload
              onImport={(sciNames) => importMutation.mutate({ sciNames })}
              isPending={importMutation.isPending}
              buttonLabel={hasList ? "Choose a new CSV file" : "Choose a CSV file"}
            />
          </Card>

          <Card className="p-5 mb-6">
            <h3 className="text-lg font-medium mb-1 text-gray-700">Exceptions</h3>
            <p className="text-sm text-gray-600 mb-3">
              Species you want to see again — they stay on your targets even though they&apos;re on your list. Applies
              to all your trips.
            </p>
            {isError && (
              <Alert style="error" className="-mx-1 my-1">
                <Icon name="xMarkCircle" className="text-xl" />
                Failed to load eBird taxonomy
                <Button color="link" onClick={() => refetch()}>
                  Retry
                </Button>
              </Alert>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Icon name="loading" className="animate-spin" />
              </div>
            ) : (
              <AsyncSelect
                value={exceptionsValue}
                loadOptions={taxonomySearch}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length > 0 ? "No species found" : "Search for a species..."
                }
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                isMulti
                isLoading={isLoading}
                onChange={(newValue: Option[]) => {
                  setExceptionsValue(newValue);
                  setExceptionsMutation.mutate({
                    exceptions: newValue.map((it) => it.value),
                  });
                }}
              />
            )}
          </Card>

          <div className="flex">
            <Button
              href={redirectUrl}
              color={isOnboarding ? "primary" : "gray"}
              className="inline-flex items-center ml-auto"
            >
              {isOnboarding ? "Continue" : "Done"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
