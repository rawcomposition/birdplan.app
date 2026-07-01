import React from "react";
import Header from "components/Header";
import { useTrip } from "hooks/useTrip";
import toast from "react-hot-toast";
import MonthSelect from "components/MonthSelect";
import Footer from "components/Footer";
import { Option } from "lib/types";
import Field from "components/Field";
import Card from "components/Card";
import { Input } from "components/ui/input";
import RangeField from "components/RangeField";
import FormPage from "components/FormPage";
import { useNavigate } from "react-router-dom";
import { months } from "lib/helpers";
import { Button } from "components/ui/button";
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

const portalTarget = () => (typeof document !== "undefined" ? document.body : null);

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
    <FormPage
      title="Trip settings"
      documentTitle="Trip Settings | BirdPlan.app"
      back={{ to: `/${trip._id}`, label: "Back to trip" }}
    >
      <form onSubmit={handleSubmit}>
        <Card className="flex flex-col gap-[22px] rounded-2xl p-5 sm:p-6">
          <Field label="Trip name">
            <Input name="name" placeholder='E.g. "Galapagos Islands 2020"' autoFocus defaultValue={trip.name} />
          </Field>

          <RangeField
            label="Dates"
            from={<Input type="date" name="startDate" value={startDate} onChange={handleStartDateChange} required />}
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

          <RangeField
            label="Trip timeframe (months)"
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

          <RegionFields value={region} onChange={setRegion} />
        </Card>

        <div className="mt-6 flex justify-end items-center gap-3">
          {isOwner && (
            <div className="border-t border-gray-100 mr-auto">
              <Button
                type="button"
                variant="link-danger"
                onClick={handleDelete}
                disabled={deleteTripMutation.isPending}
              >
                {deleteTripMutation.isPending ? "Deleting..." : "Delete trip"}
              </Button>
            </div>
          )}
          <Button href={`/${trip._id}`} variant="outline" size="lg">
            Cancel
          </Button>
          <Button type="submit" variant="default" size="lg" disabled={updateTripMutation.isPending}>
            {updateTripMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </FormPage>
  );
}
