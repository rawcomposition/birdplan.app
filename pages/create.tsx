import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Header from "components/Header";
import Head from "next/head";
import Button from "components/Button";
import Footer from "components/Footer";
import RegionSelect from "components/RegionSelect";
import MonthSelect from "components/MonthSelect";
import LoginModal from "components/LoginModal";
import Icon from "components/Icon";
import Field from "components/Field";
import Input from "components/Input";
import { Option, TripInput } from "lib/types";
import { useModal } from "providers/modals";
import dayjs from "dayjs";
import useMutation from "hooks/useMutation";
import Link from "next/link";

const largeRegions = ["MX", "US", "CA", "AU"];

const defaultMonth = {
  value: (dayjs().month() + 1).toString(),
  label: dayjs().format("MMM"),
};

export default function CreateTrip() {
  const [country, setCountry] = React.useState<Option>();
  const [state, setState] = React.useState<Option[]>();
  const [county, setCounty] = React.useState<Option[]>();
  const [manualRegion, setManualRegion] = React.useState<string>("");
  const [isManualRegion, setIsManualRegion] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState<Option>(defaultMonth);
  const [endMonth, setEndMonth] = React.useState<Option>(defaultMonth);
  const router = useRouter();
  const { close } = useModal();

  const mutation = useMutation<{ id: string }, TripInput>({
    url: "/api/v1/trips",
    method: "POST",
    onSuccess: ({ id }) => {
      router.push(`/${id}/import-targets`);
      close();
    },
  });

  const requireSubregion = largeRegions.includes(country?.value || "");

  const getRegionCode = () => {
    if (isManualRegion) {
      if (!manualRegion) return null;
      return manualRegion.trim().replaceAll(" ", "");
    }
    if (county && county.length > 0)
      return county
        .map((it) => it.value)
        .sort()
        .join(",");
    if (state && state.length > 0)
      return state
        .map((it) => it.value)
        .sort()
        .join(",");
    if (country) return country.value;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const region = getRegionCode();
    if (!region) return toast.error("Please select a region");
    if (requireSubregion && !state) return toast.error("Please select a state/province");
    const form = e.currentTarget;
    // @ts-ignore
    const name = form.name.value;
    if (!name) return toast.error("Please enter a name");

    let data: TripInput = {
      name,
      region: region,
      startMonth: Number(startMonth.value),
      endMonth: Number(endMonth.value),
    };

    mutation.mutate(data);
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
                <label className="mb-1 block">Trip Timeframe</label>
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
              {!isManualRegion && (
                <>
                  <Field label="Country Region">
                    <RegionSelect
                      type="country"
                      parent="world"
                      onChange={setCountry}
                      value={country}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    />
                  </Field>
                  <Field label="State/Province Region" isOptional={!requireSubregion}>
                    <RegionSelect
                      type="subnational1"
                      parent={country?.value}
                      onChange={setState}
                      value={state}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      isClearable={!requireSubregion}
                      isMulti
                    />
                  </Field>
                  {state?.length === 1 && (
                    <Field label="County Region" isOptional>
                      <RegionSelect
                        type="subnational2"
                        parent={state?.[0].value}
                        onChange={setCounty}
                        value={county}
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        isClearable
                        isMulti
                      />
                    </Field>
                  )}
                </>
              )}
              {isManualRegion && (
                <Field label="ebird region code(s), comma separated">
                  <Input
                    type="text"
                    name="manualRegion"
                    placeholder="E.g. US-OH-001,US-OH-003"
                    value={manualRegion}
                    onChange={(e: any) => setManualRegion(e.target.value)}
                  />
                </Field>
              )}
              {isManualRegion ? (
                <button
                  type="button"
                  onClick={() => setIsManualRegion(false)}
                  className="text-gray-600 text-sm text-left -mt-2"
                >
                  Choose regions from dropdown
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsManualRegion(true)}
                  className="text-gray-600 text-sm text-left -mt-2"
                >
                  Or manually enter regions
                </button>
              )}
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
