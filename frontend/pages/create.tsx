import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { StylesConfig } from "react-select";
import Header from "components/Header";
import Button from "components/Button";
import MonthSelect from "components/MonthSelect";
import Icon from "components/Icon";
import Input from "components/Input";
import RegionSelect from "components/RegionSelect";
import CreateTripHero from "components/CreateTripHero";
import { Option } from "lib/types";
import { TripInput } from "@birdplan/shared";
import { useModal } from "stores/modals";
import dayjs from "dayjs";
import { months } from "lib/helpers";
import useMutation from "hooks/useMutation";
import {
  RegionFieldsValue,
  emptyRegionFieldsValue,
  getRegionCode,
  requiresSubregion,
  validateRegionFields,
} from "lib/region";

const monthOption = (month: number): Option => ({
  value: month.toString(),
  label: months[month - 1],
});

const defaultMonth = monthOption(dayjs().month() + 1);

const labelClass = "mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-gray-700";
const controlClass =
  "h-[50px] w-full rounded-[13px] border-[1.5px] border-gray-200 bg-white px-4 text-[15px] font-medium text-gray-800 placeholder:text-gray-400 shadow-none outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15";

const tallSelectStyles: StylesConfig<any> = {
  control: (base, state) => ({
    ...base,
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingLeft: 6,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,.15)" : "none",
  }),
};

const portalTarget = () => (typeof document !== "undefined" ? document.body : null);

export default function CreateTrip() {
  const [region, setRegion] = React.useState<RegionFieldsValue>(emptyRegionFieldsValue);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [startMonth, setStartMonth] = React.useState<Option>(defaultMonth);
  const [endMonth, setEndMonth] = React.useState<Option>(defaultMonth);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const navigate = useNavigate();
  const { close } = useModal();

  const subregionRequired = requiresSubregion(region.country?.value);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    if (value) setStartMonth(monthOption(dayjs(value).month() + 1));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    if (value) setEndMonth(monthOption(dayjs(value).month() + 1));
  };

  const mutation = useMutation<{ id: string }, TripInput>({
    url: "/trips",
    method: "POST",
    onSuccess: ({ id }) => {
      navigate(`/${id}/lifelist?from=create`);
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
    if (!startDate) return toast.error("Please choose a start date");
    if (!endDate) return toast.error("Please choose an end date");
    if (endDate < startDate) return toast.error("End date must be on or after the start date");

    mutation.mutate({
      name,
      region: getRegionCode(region)!,
      startDate,
      endDate,
      startMonth: Number(startMonth.value),
      endMonth: Number(endMonth.value),
    });
  };

  const subregionBlock =
    !region.isManualRegion && region.country ? (
      <>
        <div>
          <label className={labelClass}>
            State / Province{!subregionRequired && <span className="ml-1.5 normal-case text-gray-400">optional</span>}
          </label>
          <RegionSelect
            type="subnational1"
            parent={region.country.value}
            value={region.states}
            onChange={(states: any) => setRegion((v) => ({ ...v, states, counties: undefined }))}
            menuPortalTarget={portalTarget()}
            styles={tallSelectStyles}
            isClearable={!subregionRequired}
            isMulti
          />
        </div>
        {region.states?.length === 1 && (
          <div>
            <label className={labelClass}>
              County <span className="ml-1.5 normal-case text-gray-400">optional</span>
            </label>
            <RegionSelect
              type="subnational2"
              parent={region.states[0].value}
              value={region.counties}
              onChange={(counties: any) => setRegion((v) => ({ ...v, counties }))}
              menuPortalTarget={portalTarget()}
              styles={tallSelectStyles}
              isClearable
              isMulti
            />
          </div>
        )}
      </>
    ) : null;

  return (
    <div className="flex h-full flex-col">
      <title>Create Trip | BirdPlan.app</title>

      <Header border />
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-7xl">
          <div className="mx-auto h-full max-w-xl overflow-y-auto lg:mx-0">
            <div className="flex min-h-full flex-col px-5 py-8 sm:px-9 lg:pr-0">
              <Link
                to="/trips"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                <Icon name="angleLeft" className="text-xs" />
                Back to trips
              </Link>

              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">New trip</p>
              <h1 className="mb-7 text-3xl font-bold tracking-tight text-gray-800">Where are you headed?</h1>

              <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-[22px]">
                  <div>
                    <label className={labelClass}>Trip name</label>
                    <Input
                      type="text"
                      name="name"
                      placeholder='E.g. "Galapagos Islands 2020"'
                      autoFocus
                      className={controlClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Country / region</label>
                    {region.isManualRegion ? (
                      <Input
                        type="text"
                        name="manualRegion"
                        placeholder="E.g. US-OH-001,US-OH-003"
                        value={region.manualRegion}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegion((v) => ({ ...v, manualRegion: e.target.value }))
                        }
                        className={controlClass}
                      />
                    ) : (
                      <RegionSelect
                        type="country"
                        parent="world"
                        value={region.country}
                        onChange={(country: any) =>
                          setRegion((v) => ({ ...v, country, states: undefined, counties: undefined }))
                        }
                        menuPortalTarget={portalTarget()}
                        styles={tallSelectStyles}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setRegion((v) => ({ ...v, isManualRegion: !v.isManualRegion }))}
                      className="mt-2 text-[13px] font-medium text-gray-500 hover:text-gray-700"
                    >
                      {region.isManualRegion ? "Choose regions from a list" : "Or enter eBird region codes manually"}
                    </button>
                  </div>

                  {subregionRequired && subregionBlock}

                  <div>
                    <label className={labelClass}>Dates</label>
                    <div className="flex items-center gap-2.5">
                      <Input
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={handleStartDateChange}
                        required
                        className={`${controlClass} flex-1`}
                      />
                      <span className="text-sm font-medium text-gray-400">to</span>
                      <Input
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate || undefined}
                        required
                        className={`${controlClass} flex-1`}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((prev) => !prev)}
                      className="flex w-full items-center gap-2 py-3 text-[13px] font-bold text-gray-500 hover:text-gray-700"
                    >
                      <Icon
                        name="angleDown"
                        className={`text-xs transition-transform ${showAdvanced ? "" : "-rotate-90"}`}
                      />
                      Advanced — {subregionRequired ? "trip timeframe" : "state/province, trip timeframe"}
                    </button>
                    {showAdvanced && (
                      <div className="mt-1 flex flex-col gap-[22px]">
                        {!subregionRequired && subregionBlock}
                        <div>
                          <label className={labelClass}>Trip timeframe (months)</label>
                          <div className="flex items-center gap-2.5">
                            <MonthSelect
                              onChange={setStartMonth}
                              value={startMonth}
                              instanceId="startMonth"
                              className="grow"
                              styles={tallSelectStyles}
                              menuPortalTarget={portalTarget()}
                            />
                            <span className="text-sm font-medium text-gray-400">to</span>
                            <MonthSelect
                              onChange={setEndMonth}
                              value={endMonth}
                              instanceId="endMonth"
                              className="grow"
                              styles={tallSelectStyles}
                              menuPortalTarget={portalTarget()}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Used to determine your target species — a wider range may yield more accurate results.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex justify-end gap-3 pt-8">
                  <Button href="/trips" color="pillOutlineGray" className="px-6 py-3 text-sm">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="pillPrimary"
                    disabled={mutation.isPending}
                    className="inline-flex items-center gap-2 px-7 py-3 text-sm shadow-lg shadow-primary/30"
                  >
                    {mutation.isPending ? (
                      <>
                        <Icon name="loading" className="animate-spin text-md text-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <Icon name="arrowRight" className="text-xs" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <CreateTripHero />
      </main>
    </div>
  );
}
