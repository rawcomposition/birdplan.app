import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Field from "components/Field";
import Input from "components/Input";
import { Option, TripInput } from "lib/types";
import { createTrip } from "lib/firebase";
import toast from "react-hot-toast";
import { getBounds } from "lib/helpers";
import { useRouter } from "next/router";
import RegionSelect from "components/RegionSelect";
import MonthSelect from "components/MonthSelect";
import { useModal } from "providers/modals";
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

  const requireSubregion = largeRegions.includes(country?.value || "");

  const getRegionCode = () => {
    if (county) return county.map((it) => it.value).join(",");
    if (state) return state.map((it) => it.value).join(",");
    if (country) return country.value;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const region = getRegionCode();
    if (!region) return toast.error("Please select a region");
    if (requireSubregion && !state) return toast.error("Please select a state/province");
    setSubmitting(true);
    const form = e.currentTarget;
    // @ts-ignore
    const name = form.name.value;

    const bounds = await getBounds(region);
    if (!bounds) return toast.error("Failed to fetch region info");
    console.log(bounds);

    try {
      let data: TripInput = {
        name,
        region: region,
        hotspots: [],
        targets: [],
        markers: [],
        bounds,
        startMonth: Number(startMonth.value),
        endMonth: Number(endMonth.value),
      };

      const trip = await createTrip(data);
      if (trip) {
        router.push(`/${trip.id}`);
        close();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create trip");
    }
    setSubmitting(false);
  };

  return (
    <>
      <Header>Create Trip</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
            <Field label="Name">
              <Input type="text" name="name" autoFocus />
            </Field>
            <div>
              <label className="mb-1 block">Trip Timeframe</label>
              <div className="flex gap-2 items-center">
                <MonthSelect
                  onChange={setStartMonth}
                  value={startMonth}
                  instanceId="startMonth"
                  className="flex-grow"
                  menuPortalTarget={document.body}
                />
                <span className="text-gray-500 px-2">to</span>
                <MonthSelect
                  onChange={setEndMonth}
                  value={endMonth}
                  instanceId="endMonth"
                  className="flex-grow"
                  menuPortalTarget={document.body}
                />
              </div>
            </div>
            <Field label="Country">
              <RegionSelect
                type="country"
                parent="world"
                onChange={setCountry}
                value={country}
                menuPortalTarget={document.body}
              />
            </Field>
            <Field label={requireSubregion ? "State/Province" : "State/Province"} isOptional={!requireSubregion}>
              <RegionSelect
                type="subnational1"
                parent={country?.value}
                onChange={setState}
                value={state}
                menuPortalTarget={document.body}
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
                  menuPortalTarget={document.body}
                  isClearable
                  isMulti
                />
              </Field>
            )}
            <Button type="submit" color="primary" className="mt-2" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </div>
      </Body>
    </>
  );
}
