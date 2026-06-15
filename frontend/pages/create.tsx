import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Header from "components/Header";
import Head from "next/head";
import Button from "components/Button";
import Footer from "components/Footer";
import MonthSelect from "components/MonthSelect";
import LoginModal from "components/LoginModal";
import Icon from "components/Icon";
import Field from "components/Field";
import Input from "components/Input";
import { Option } from "lib/types";
import { TripInput } from "@birdplan/shared";
import { useModal } from "providers/modals";
import dayjs from "dayjs";
import useMutation from "hooks/useMutation";
import RegionFields from "components/RegionFields";
import Link from "next/link";
import {
  RegionFieldsValue,
  emptyRegionFieldsValue,
  getRegionCode,
  validateRegionFields,
} from "lib/region";

const defaultMonth = {
  value: (dayjs().month() + 1).toString(),
  label: dayjs().format("MMM"),
};

export default function CreateTrip() {
  const [region, setRegion] = React.useState<RegionFieldsValue>(emptyRegionFieldsValue);
  const [startMonth, setStartMonth] = React.useState<Option>(defaultMonth);
  const [endMonth, setEndMonth] = React.useState<Option>(defaultMonth);
  const router = useRouter();
  const { close } = useModal();

  const mutation = useMutation<{ id: string }, TripInput>({
    url: "/trips",
    method: "POST",
    onSuccess: ({ id }) => {
      router.push(`/${id}/lifelist?from=create`);
      close();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    if (!name) return toast.error("Please enter a name");
    const regionError = validateRegionFields(region);
    if (regionError) return toast.error(regionError);

    mutation.mutate({
      name,
      region: getRegionCode(region)!,
      startMonth: Number(startMonth.value),
      endMonth: Number(endMonth.value),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Create Trip | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-lg w-full mx-auto pb-12">
        <Link href="/trips" className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center">
          ← Back to trips
        </Link>
        <div className="p-4 md:p-0 mt-12">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Icon name="genericMarker" className="text-2xl text-[#fd1743] -mt-1" /> Create Trip
          </h1>
          <div className="flex gap-2 mb-2">
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
              <Field label="Name Your Trip">
                <Input type="text" name="name" placeholder='E.g. "Galapagos Islands 2020"' autoFocus />
              </Field>
              <div>
                <label className="mb-1 block font-medium text-sm text-gray-700">Trip Timeframe</label>
                <div className="flex gap-2 items-center">
                  <MonthSelect
                    onChange={setStartMonth}
                    value={startMonth}
                    instanceId="startMonth"
                    className="flex-grow"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  />
                  <span className="text-gray-500 px-2">to</span>
                  <MonthSelect
                    onChange={setEndMonth}
                    value={endMonth}
                    instanceId="endMonth"
                    className="flex-grow"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  />
                </div>
              </div>
              <RegionFields value={region} onChange={setRegion} />
              <div className="flex justify-between">
                <Button href="/trips" color="gray">
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Icon name="loading" className="animate-spin text-md text-white" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
