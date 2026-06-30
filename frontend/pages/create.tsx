import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Header from "components/Header";
import { Button } from "components/ui/button";
import MonthSelect from "components/MonthSelect";
import Icon from "components/Icon";
import Field from "components/Field";
import BackLink from "components/BackLink";
import Heading from "components/Heading";
import { Input } from "components/ui/input";
import RangeField from "components/RangeField";
import Expander from "components/Expander";
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
import { Flow } from "lib/enums";

const monthOption = (month: number): Option => ({
  value: month.toString(),
  label: months[month - 1],
});

const defaultMonth = monthOption(dayjs().month() + 1);

const portalTarget = () => (typeof document !== "undefined" ? document.body : null);

export default function CreateTrip() {
  const [region, setRegion] = React.useState<RegionFieldsValue>(emptyRegionFieldsValue);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [startMonth, setStartMonth] = React.useState<Option>(defaultMonth);
  const [endMonth, setEndMonth] = React.useState<Option>(defaultMonth);
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
      navigate(`/${id}/lifelist?from=${Flow.Create}`);
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
        <Field label="State / Province" isOptional={!subregionRequired}>
          <RegionSelect
            type="subnational1"
            parent={region.country.value}
            value={region.states}
            onChange={(states: any) => setRegion((v) => ({ ...v, states, counties: undefined }))}
            menuPortalTarget={portalTarget()}
            isClearable={!subregionRequired}
            isMulti
          />
        </Field>
        {region.states?.length === 1 && (
          <Field label="County" isOptional>
            <RegionSelect
              type="subnational2"
              parent={region.states[0].value}
              value={region.counties}
              onChange={(counties: any) => setRegion((v) => ({ ...v, counties }))}
              menuPortalTarget={portalTarget()}
              isClearable
              isMulti
            />
          </Field>
        )}
      </>
    ) : null;

  return (
    <div className="flex h-full flex-col">
      <title>Create Trip | BirdPlan.app</title>

      <Header border />
      <main className="relative min-h-0 flex-1 overflow-hidden lg:flex">
        <div className="h-full overflow-y-auto lg:w-[37rem] lg:shrink-0 xl:w-[43rem]">
          <div className="mx-auto flex min-h-full max-w-xl flex-col xl:max-w-2xl">
            <div className="flex flex-1 flex-col px-5 py-8 sm:px-10">
              <BackLink to="/trips" label="Back to trips" className="mb-6" />

              <Heading hat="New trip" title="Where are you headed?" className="mb-7" />

              <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-[22px]">
                  <Field label="Trip name">
                    <Input name="name" placeholder='E.g. "Galapagos Islands 2020"' autoFocus />
                  </Field>

                  <Field
                    label="Country / region"
                    rightButton={
                      <Button
                        variant="link"
                        onClick={() => setRegion((v) => ({ ...v, isManualRegion: !v.isManualRegion }))}
                        className="text-xs"
                      >
                        {region.isManualRegion ? "Choose from list" : "Enter manually"}
                      </Button>
                    }
                  >
                    {region.isManualRegion ? (
                      <Input
                        name="manualRegion"
                        placeholder="E.g. US-OH-001,US-OH-003"
                        value={region.manualRegion}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRegion((v) => ({ ...v, manualRegion: e.target.value }))
                        }
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
                      />
                    )}
                  </Field>

                  {subregionBlock}

                  <RangeField
                    label="Dates"
                    from={
                      <Input type="date" name="startDate" value={startDate} onChange={handleStartDateChange} required />
                    }
                    to={
                      <Input
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={handleEndDateChange}
                        min={startDate || undefined}
                        required
                      />
                    }
                  />

                  <Expander label="Advanced">
                    <RangeField
                      label="Trip timeframe"
                      help="Used to determine your target species — a wider range may yield more accurate results."
                      from={
                        <MonthSelect
                          onChange={setStartMonth}
                          value={startMonth}
                          instanceId="startMonth"
                          menuPortalTarget={portalTarget()}
                        />
                      }
                      to={
                        <MonthSelect
                          onChange={setEndMonth}
                          value={endMonth}
                          instanceId="endMonth"
                          menuPortalTarget={portalTarget()}
                        />
                      }
                    />
                  </Expander>
                </div>

                <div className="mt-auto flex justify-end gap-3 pt-8">
                  <Button href="/trips" variant="outline" shape="pill" size="xl">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default" shape="pill"
                    size="xl"
                    loading={mutation.isPending}
                    loadingText="Saving..."
                    className="inline-flex items-center gap-2"
                  >
                    Continue
                    <Icon name="arrowRight" className="text-xs" />
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
