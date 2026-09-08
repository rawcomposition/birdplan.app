import { Link } from "react-router-dom";
import WidgetCard from "components/WidgetCard";
import EmptyState from "components/EmptyState";
import useHotspotLists from "hooks/useHotspotLists";
import useSavedHotspots from "hooks/useSavedHotspots";
import { useModal } from "stores/modals";

export default function HotspotListsWidget() {
  const { open } = useModal();
  const { lists, isError, refetch } = useHotspotLists();
  const { savedHotspots } = useSavedHotspots();

  const countFor = (listId: string) => savedHotspots.filter((it) => it.listIds.includes(listId)).length;

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
          {lists.map((list) => (
            <li key={list._id} className="border-b border-border/40 last:border-0">
              <Link
                to={`/explore?list=${list._id}`}
                className="flex items-center justify-between gap-3 py-3 hover:text-link"
              >
                <span className="min-w-0 truncate text-sm font-medium text-foreground">{list.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{countFor(list._id)} hotspots</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
