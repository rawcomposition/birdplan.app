import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Header from "components/Header";
import Head from "next/head";
import Sidebar from "components/Sidebar";
import Button from "components/Button";
import Footer from "components/Footer";
import RegionSelect from "components/RegionSelect";
import MonthSelect from "components/MonthSelect";
import LoginModal from "components/LoginModal";
import GenericMarker from "icons/GenericMarker";
import Field from "components/Field";
import Input from "components/Input";
import { Option, TripInput } from "lib/types";
import { createTrip } from "lib/firebase";
import { getBounds, getCenterOfBounds, getTzFromLatLng } from "lib/helpers";
import { useModal } from "providers/modals";
import { useUI } from "providers/ui";
import dayjs from "dayjs";

const largeRegions = ["MX", "US", "CA", "AU"];

const defaultMonth = {
  value: (dayjs().month() + 1).toString(),
  label: dayjs().format("MMM"),
};

export default function CreateTrip() {
  const [country, setCountry] = React.useState<Option>();
  const [state, setState] = React.useState<Option[]>();
  const [county, setCounty] = React.useState<Option[]>();
  const [submitting, setSubmitting] = React.useState(false);
  const [startMonth, setStartMonth] = React.useState<Option>(defaultMonth);
  const [endMonth, setEndMonth] = React.useState<Option>(defaultMonth);
  const router = useRouter();
  const { close } = useModal();
  const { closeSidebar } = useUI();

  const requireSubregion = largeRegions.includes(country?.value || "");

  const getRegionCode = () => {
    if (county)
      return county
        .map((it) => it.value)
        .sort()
        .join(",");
    if (state)
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

    try {
      setSubmitting(true);

      const bounds = await getBounds(region);
      if (!bounds) return toast.error("Failed to fetch region info");

      const { lat, lng } = getCenterOfBounds(bounds);
      const timezone = await getTzFromLatLng(lat, lng);

      let data: TripInput = {
        name,
        region: region,
        hotspots: [],
        markers: [],
        bounds,
        startMonth: Number(startMonth.value),
        endMonth: Number(endMonth.value),
        timezone: timezone || "America/New_York",
        createdAt: dayjs().format(),
      };

      const tripId = await createTrip(data);
      if (tripId) {
        router.push(`/${tripId}/import-targets`);
        close();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create trip");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Bird Planner</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-lg w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0 mt-12" onClick={closeSidebar}>
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <GenericMarker className="text-2xl text-[#fd1743] -mt-1" /> Create Trip
          </h1>
          <div className="flex gap-2 mb-2">
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
              <Field label="Name">
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
                    menuPortalTarget={typeof document !== "undefined" && document.body}
                  />
                  <span className="text-gray-500 px-2">to</span>
                  <MonthSelect
                    onChange={setEndMonth}
                    value={endMonth}
                    instanceId="endMonth"
                    className="flex-grow"
                    menuPortalTarget={typeof document !== "undefined" && document.body}
                  />
                </div>
              </div>
              <Field label="Country">
                <RegionSelect
                  type="country"
                  parent="world"
                  onChange={setCountry}
                  value={country}
                  menuPortalTarget={typeof document !== "undefined" && document.body}
                />
              </Field>
              <Field label={requireSubregion ? "State/Province" : "State/Province"} isOptional={!requireSubregion}>
                <RegionSelect
                  type="subnational1"
                  parent={country?.value}
                  onChange={setState}
                  value={state}
                  menuPortalTarget={typeof document !== "undefined" && document.body}
                  isClearable={!requireSubregion}
                  isMulti
                />
              </Field>
              {state?.length === 1 && (
                <Field label="County" isOptional>
                  <RegionSelect
                    type="subnational2"
                    parent={state?.[0].value}
                    onChange={setCounty}
                    value={county}
                    menuPortalTarget={typeof document !== "undefined" && document.body}
                    isClearable
                    isMulti
                  />
                </Field>
              )}
              <div className="flex justify-between">
                <Button href="/trips" color="gray">
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Continue"}
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
