import { Link } from "react-router-dom";
import { MapPinPlus } from "lucide-react";
import WidgetCard from "components/WidgetCard";
import EmptyState from "components/EmptyState";
import useHotspotLists from "hooks/useHotspotLists";
import useSavedHotspots from "hooks/useSavedHotspots";
import { useModal } from "stores/modals";
import { HotspotList } from "@birdplan/shared";
import OptionsMenu from "components/OptionsMenu";
import { DropdownMenuTrigger } from "components/ui/dropdown-menu";
import { Button } from "components/ui/button";
import Icon from "components/Icon";
import { savedHotspotsInList } from "lib/helpers";

export default function HotspotListsWidget() {
  const { open } = useModal();
  const { lists, isError, refetch } = useHotspotLists();
  const { savedHotspots } = useSavedHotspots();

  const addToTrip = (list: HotspotList) =>
    open("addToTrip", {
      subtitle: list.name,
      hotspots: savedHotspotsInList(savedHotspots, list._id),
    });

  return (
    <WidgetCard title="Lists" action={{ label: "Manage", onClick: () => open("manageHotspotLists") }}>
      {isError ? (
        <EmptyState
          inline
          variant="destructive"
          className="mx-0 mt-3"
          title="Failed to load lists"
          onRetry={() => refetch()}
        />
      ) : lists.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No lists yet. Save hotspots from{" "}
          <Link className="font-bold text-link" to="/explore">
            Explore
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <ul className="flex flex-col">
          {lists.map((list) => {
            const count = savedHotspots.filter((it) => it.listIds.includes(list._id)).length;
            return (
              <li key={list._id} className="flex items-center gap-2 border-b border-border/40 last:border-0">
                <Link
                  to={`/explore?list=${list._id}`}
                  className="flex min-w-0 grow items-center justify-between gap-3 py-3 hover:text-link"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">{list.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{count} hotspots</span>
                </Link>
                <OptionsMenu
                  items={[
                    {
                      name: "Import to Trip",
                      icon: <MapPinPlus />,
                      onClick: () => addToTrip(list),
                    },
                  ]}
                  className="min-w-[180px]"
                >
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} title="Options">
                    <Icon name="verticalDots" />
                  </DropdownMenuTrigger>
                </OptionsMenu>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
