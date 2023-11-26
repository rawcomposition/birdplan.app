import React from "react";
import Expand from "components/Expand";
import { useTrip } from "providers/trip";
import Link from "next/link";
import Feather from "icons/Feather";
import Bullseye from "icons/Bullseye";
import Pencil from "icons/Pencil";
import Trash from "icons/Trash";
import ShareIcon from "icons/Share";
import { useRouter } from "next/router";
import { useModal } from "providers/modals";
import { deleteTrip } from "lib/firebase";
import { useProfile } from "providers/profile";
import Export from "icons/Export";

export default function SettingsSidebarBlock() {
  const { open } = useModal();
  const router = useRouter();
  const { lifelist } = useProfile();
  const { targets, trip, isOwner } = useTrip();

  const handleDelete = async () => {
    if (!trip) return;
    if (confirm("Are you sure you want to delete this trip?")) {
      await deleteTrip(trip.id);
      router.push("/trips");
    }
  };

  return (
    <Expand heading="Settings">
      <div className="text-sm text-gray-400 flex flex-col gap-3">
        <Link href={`/import-lifelist?tripId=${trip?.id}`} className="flex items-center gap-2 text-gray-300">
          <Feather aria-hidden="true" />
          {!!lifelist?.length ? `Update Life List (${lifelist?.length?.toLocaleString()})` : "Import Life List"}
        </Link>
        <Link href={`/${trip?.id}/import-targets`} className="flex items-center gap-2 text-gray-300">
          <Bullseye aria-hidden="true" />
          {!!targets?.items?.length ? "Update Targets" : "Import Targets"}
        </Link>
        <button onClick={() => open("renameTrip", { trip })} className="flex items-center gap-2 text-gray-300">
          <Pencil aria-hidden="true" />
          Rename Trip
        </button>
        {isOwner && (
          <button type="button" className="text-gray-300 flex items-center gap-2" onClick={() => open("share")}>
            <ShareIcon />
            Share Trip
          </button>
        )}
        <Link href={`/api/trips/${trip?.id}/export`} target="_blank" className="flex items-center gap-2 text-gray-300">
          <Export aria-hidden="true" />
          Export KML
        </Link>
        <button onClick={handleDelete} className="flex items-center gap-2 text-red-500">
          <Trash aria-hidden="true" />
          Delete Trip
        </button>
      </div>
    </Expand>
  );
}
