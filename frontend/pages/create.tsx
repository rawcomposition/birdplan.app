import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Header from "components/Header";
import Button from "components/Button";
import Footer from "components/Footer";
import MonthSelect from "components/MonthSelect";
import Icon from "components/Icon";
import Field from "components/Field";
import Input from "components/Input";
import { Option } from "lib/types";
import { TripInput } from "@birdplan/shared";
import { useModal } from "stores/modals";
import dayjs from "dayjs";
import { months } from "lib/helpers";
import useMutation from "hooks/useMutation";
import RegionFields from "components/RegionFields";
import { Link } from "react-router-dom";
import {
  RegionFieldsValue,
  emptyRegionFieldsValue,
  getRegionCode,
  validateRegionFields,
} from "lib/region";

const monthOption = (month: number): Option => ({
  value: month.toString(),
  label: months[month - 1],
});

const defaultMonth = monthOption(dayjs().month() + 1);

export default function CreateTrip() {
  const [region, setRegion] = React.useState<RegionFieldsValue>(emptyRegionFieldsValue);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [startMonth, setStartMonth] = React.useState<Option>(defaultMonth);
  const [endMonth, setEndMonth] = React.useState<Option>(defaultMonth);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const navigate = useNavigate();
  const { close } = useModal();

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

    mutation.mutate({
      name,
      region: getRegionCode(region)!,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      startMonth: Number(startMonth.value),
      endMonth: Number(endMonth.value),
    });
  };

  return (
    <div className="flex flex-col h-full">
        <title>Create Trip | BirdPlan.app</title>

      <Header />
      <main className="max-w-lg w-full mx-auto pb-12">
        <Link to="/trips" className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center">
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
                <label className="mb-1 block font-medium text-sm text-gray-700">Trip Dates</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="grow"
                  />
                  <span className="text-gray-500 px-2">to</span>
                  <Input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="grow"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Approximate dates are fine — you can refine them later.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-600"
                >
                  <Icon
                    name="angleDown"
                    className={`text-xs transition-transform ${showAdvanced ? "" : "-rotate-90"}`}
                  />
                  Advanced
                </button>
                {showAdvanced && (
                  <div className="mt-3">
                    <label className="mb-1 block font-medium text-sm text-gray-700">Trip Timeframe (months)</label>
                    <div className="flex gap-2 items-center">
                      <MonthSelect
                        onChange={setStartMonth}
                        value={startMonth}
                        instanceId="startMonth"
                        className="grow"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      />
                      <span className="text-gray-500 px-2">to</span>
                      <MonthSelect
                        onChange={setEndMonth}
                        value={endMonth}
                        instanceId="endMonth"
                        className="grow"
                        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      />
                    </div>
                  </div>
                )}
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
    </div>
  );
}
