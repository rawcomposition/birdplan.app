import React from "react";
import Header from "components/Header";
import { useTrip } from "hooks/useTrip";
import toast from "react-hot-toast";
import MonthSelect from "components/MonthSelect";
import Footer from "components/Footer";
import { Option } from "lib/types";
import Field from "components/Field";
import Input from "components/Input";
import { useNavigate, Link } from "react-router-dom";
import { months } from "lib/helpers";
import Button from "components/Button";
import NotFound from "components/NotFound";
import useMutation from "hooks/useMutation";
import useResolvedRegion from "hooks/useResolvedRegion";
import RegionFields from "components/RegionFields";
import Icon from "components/Icon";
import { useQueryClient } from "@tanstack/react-query";
import { getRegionCode, validateRegionFields, RegionFieldsValue } from "lib/region";
import { Trip } from "@birdplan/shared";
import dayjs from "dayjs";

const monthOption = (month: number): Option => ({
  value: month.toString(),
  label: months[month - 1],
});

export default function TripSettings() {
  const { trip, is404, isOwner } = useTrip();
  const initialRegion = useResolvedRegion(trip?.region);

  if (is404) return <NotFound />;
  if (!trip || !initialRegion) {
    return (
      <div className="flex flex-col h-full">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Icon name="loading" className="text-2xl text-gray-400 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return <SettingsForm key={trip._id} trip={trip} initialRegion={initialRegion} isOwner={isOwner} />;
}

type SettingsFormProps = {
  trip: Trip;
  initialRegion: RegionFieldsValue;
  isOwner: boolean;
};

function SettingsForm({ trip, initialRegion, isOwner }: SettingsFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = React.useState(trip.startDate ?? "");
  const [endDate, setEndDate] = React.useState(trip.endDate ?? "");
  const [startMonth, setStartMonth] = React.useState<Option>(monthOption(trip.startMonth));
  const [endMonth, setEndMonth] = React.useState<Option>(monthOption(trip.endMonth));
  const [region, setRegion] = React.useState<RegionFieldsValue>(initialRegion);

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

  const deleteTripMutation = useMutation({
    url: `/trips/${trip._id}`,
    method: "DELETE",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/trips/stats"] });
      navigate("/trips");
    },
  });

  const updateTripMutation = useMutation({
    url: `/trips/${trip._id}`,
    method: "PATCH",
    onSuccess: async () => {
      toast.success("Trip updated");
      queryClient.invalidateQueries({ queryKey: ["/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/trips/stats"] });
      await queryClient.invalidateQueries({ queryKey: [`/trips/${trip._id}`] });
      navigate(`/${trip._id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    if (!name) return toast.error("Please enter a name");
    const regionError = validateRegionFields(region);
    if (regionError) return toast.error(regionError);
    if (!startDate) return toast.error("Please choose a start date");
    if (!endDate) return toast.error("Please choose an end date");
    if (endDate < startDate) return toast.error("End date must be on or after the start date");
    updateTripMutation.mutate({
      name,
      region: getRegionCode(region)!,
      startDate,
      endDate,
      startMonth: Number(startMonth.value),
      endMonth: Number(endMonth.value),
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    deleteTripMutation.mutate({});
  };

  return (
    <div className="flex flex-col h-full">
      <title>Trip Settings | BirdPlan.app</title>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Link
          to={`/${trip._id}`}
          className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
        >
          ← Back to trip
        </Link>
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">⚙️ Trip Settings</h1>
          <div className="flex gap-2 mb-2">
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
              <Field label="Name Your Trip">
                <Input
                  type="text"
                  name="name"
                  placeholder='E.g. "Galapagos Islands 2020"'
                  autoFocus
                  defaultValue={trip.name}
                />
              </Field>
              <div>
                <label className="mb-1 block font-medium text-sm text-gray-700">Trip Dates</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    required
                    className="grow"
                  />
                  <span className="text-gray-500 px-2">to</span>
                  <Input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={startDate || undefined}
                    required
                    className="grow"
                  />
                </div>
              </div>
              <div>
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
                <p className="mt-1 text-xs text-gray-600">
                  Used to determine your target species — a wider range may yield more accurate results.
                </p>
              </div>
              <RegionFields value={region} onChange={setRegion} />
              <div className="flex justify-between">
                <Button href="/trips" color="gray">
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={updateTripMutation.isPending}>
                  {updateTripMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              {isOwner && (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 text-sm"
                    disabled={deleteTripMutation.isPending}
                  >
                    {deleteTripMutation.isPending ? "Deleting..." : "Delete Trip"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
