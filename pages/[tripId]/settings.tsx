import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import MonthSelect from "components/MonthSelect";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import { Option } from "lib/types";
import Field from "components/Field";
import Input from "components/Input";
import { useRouter } from "next/router";
import Link from "next/link";
import { months } from "lib/helpers";
import Button from "components/Button";
import { updateTrip, deleteTrip } from "lib/firebase";
import NotFound from "components/NotFound";

export default function TripSettings() {
  const { trip, is404 } = useTrip();
  const [startMonth, setStartMonth] = React.useState<Option>();
  const [endMonth, setEndMonth] = React.useState<Option>();
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (!trip) return;
    setEndMonth({ value: trip.endMonth.toString(), label: months[trip.endMonth - 1] });
    setStartMonth({ value: trip.startMonth.toString(), label: months[trip.startMonth - 1] });
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const name = (form.name as any).value;
    if (!name) return toast.error("Please enter a name");
    if (!startMonth || !endMonth) return toast.error("Please select a timeframe");
    if (!trip) return;
    const start = Number(startMonth.value);
    const end = Number(endMonth.value);
    const hasTimeframeChanged = start !== trip.startMonth || end !== trip.endMonth;
    await updateTrip({ tripId: trip.id, name, startMonth: start, endMonth: end });
    toast.success("Trip updated");
    setSubmitting(false);
    router.push(hasTimeframeChanged ? `/${trip.id}/import-targets` : `/${trip.id}`);
  };

  const handleDelete = async () => {
    if (!trip) return;
    if (!confirm("Are you sure you want to delete this trip?")) return;
    deleteTrip(trip.id);
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Trip Settings | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Link href={`/${trip?.id}`} className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
          ← Back to trip
        </Link>
        <div className="p-4 md:p-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">⚙️ Trip Settings</h1>
          <div className="flex gap-2 mb-2">
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
              <Field label="Name Your Trip">
                <Input
                  type="text"
                  name="name"
                  placeholder='E.g. "Galapagos Islands 2020"'
                  autoFocus
                  defaultValue={trip?.name}
                />
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
              <div className="flex justify-between">
                <Button href="/trips" color="gray">
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
              <div className="mt-8">
                <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-600 text-sm">
                  Delete Trip
                </button>
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
