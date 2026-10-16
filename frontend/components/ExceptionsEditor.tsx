import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, Search } from "lucide-react";
import { useUser } from "hooks/useUser";
import useMutation from "hooks/useMutation";
import useDownloadTargets from "hooks/useDownloadTargets";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import SegmentedControl from "components/SegmentedControl";
import LoadingState from "components/LoadingState";
import EmptyState from "components/EmptyState";

type Taxon = {
  name: string;
  code: string;
  sciName: string;
  order: string;
  taxonOrder: number;
  familyCode: string;
  familyComName: string;
  familySciName: string;
};

type SortKey = "name" | "sciName" | "order";
type Scope = "potential" | "all" | "selected";

type Props = {
  region?: string;
  startMonth?: number;
  endMonth?: number;
};

export default function ExceptionsEditor({ region, startMonth, endMonth }: Props) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [scope, setScope] = React.useState<Scope>(region ? "potential" : "all");
  const [sortKey, setSortKey] = React.useState<SortKey>("order");
  const [ascending, setAscending] = React.useState(true);
  const [collapsedFamilies, setCollapsedFamilies] = React.useState<Set<string>>(new Set());
  const { data: taxonomy, isLoading, isError, refetch } = useQuery<Taxon[]>({ queryKey: ["/taxonomy"] });
  const { data: targetData, isLoading: isLoadingPotential } = useDownloadTargets({
    region,
    startMonth,
    endMonth,
    enabled: !!region,
  });

  const exceptions = user?.exceptions ?? [];
  const exceptionSet = new Set(exceptions);
  const lifeListSet = new Set(user?.lifelist ?? []);
  const potentialCodes = React.useMemo(() => new Set(targetData?.items?.map((item) => item.code) ?? []), [targetData]);
  const hasPotentialFilter = !!region && !!targetData;
  const scopes: Scope[] = region ? ["potential", "all", "selected"] : ["all", "selected"];
  const activeScope = !region && scope === "potential" ? "all" : scope;

  const setExceptionsMutation = useMutation<{ exceptions: string[] }, { exceptions: string[] }>({
    url: "/profile",
    method: "PATCH",
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/auth/me"] }),
  });

  const species = (taxonomy ?? [])
    .filter((taxon) => lifeListSet.has(taxon.code))
    .filter((taxon) => {
      if (activeScope === "selected") return exceptionSet.has(taxon.code);
      if (activeScope === "potential" && hasPotentialFilter) return potentialCodes.has(taxon.code) || exceptionSet.has(taxon.code);
      return true;
    })
    .filter((taxon) => `${taxon.name} ${taxon.sciName}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aValue = sortKey === "order" ? a.taxonOrder : a[sortKey];
      const bValue = sortKey === "order" ? b.taxonOrder : b[sortKey];
      const result = typeof aValue === "number" && typeof bValue === "number" ? aValue - bValue : String(aValue).localeCompare(String(bValue));
      return ascending ? result : -result;
    });
  const potentialLifeListCount = hasPotentialFilter
    ? (taxonomy ?? []).filter((taxon) => lifeListSet.has(taxon.code) && potentialCodes.has(taxon.code)).length
    : 0;
  const retainedOutsidePotentialCount = hasPotentialFilter
    ? (taxonomy ?? []).filter((taxon) => lifeListSet.has(taxon.code) && exceptionSet.has(taxon.code) && !potentialCodes.has(taxon.code)).length
    : 0;
  const familyGroups = species.reduce<{ key: string; name: string; sciName: string; species: Taxon[] }[]>((groups, taxon) => {
    const key = taxon.familyCode || taxon.familyComName || "other";
    const group = groups.at(-1);
    if (!group || group.key !== key) {
      groups.push({ key, name: taxon.familyComName || "Other species", sciName: taxon.familySciName, species: [taxon] });
    } else {
      group.species.push(taxon);
    }
    return groups;
  }, []);
  const isTaxonomicView = sortKey === "order";

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAscending((value) => !value);
    else {
      setSortKey(key);
      setAscending(true);
    }
  };

  const toggle = (code: string) => {
    const next = exceptionSet.has(code) ? exceptions.filter((value) => value !== code) : [...exceptions, code];
    setExceptionsMutation.mutate({ exceptions: next });
  };

  const toggleFamily = (familyCode: string) => {
    setCollapsedFamilies((current) => {
      const next = new Set(current);
      if (next.has(familyCode)) next.delete(familyCode);
      else next.add(familyCode);
      return next;
    });
  };

  const setAllFamiliesCollapsed = (collapsed: boolean) =>
    setCollapsedFamilies(collapsed ? new Set(familyGroups.map((group) => group.key)) : new Set());

  const sortLabel = (key: SortKey, label: string) => (
    <button type="button" className="inline-flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => toggleSort(key)}>
      {label}
      {sortKey === key && (ascending ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
    </button>
  );

  return (
    <section aria-labelledby="exceptions-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="exceptions-heading" className="text-lg font-medium text-secondary-foreground">Include previously seen species</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Checked species stay in targets and hotspot results even though they are on your life list. Changes apply to all your trips.
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {exceptions.length} included
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search common or scientific name" className="pl-9" />
        </label>
        <SegmentedControl
          value={activeScope}
          onChange={setScope}
          options={scopes.map((value) => ({
            value,
            label: value === "potential" ? "Potentially present" : value === "all" ? "All life-list species" : "Selected",
          }))}
          className="max-w-full overflow-x-auto"
        />
      </div>

      {region && isLoadingPotential && <p className="mt-3 text-xs text-muted-foreground">Finding species potentially present for this trip…</p>}
      {region && hasPotentialFilter && activeScope === "potential" && (
        <div className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-secondary-foreground">Potentially present:</span> {potentialLifeListCount.toLocaleString()} of {lifeListSet.size.toLocaleString()} life-list species for this trip&apos;s region and season.
          {search && <span className="ml-1">Showing {species.length.toLocaleString()} matching species.</span>}
          {retainedOutsidePotentialCount > 0 && <span className="ml-1">{retainedOutsidePotentialCount.toLocaleString()} checked species outside these results also shown.</span>}
        </div>
      )}
      {region && !isLoadingPotential && !hasPotentialFilter && (
        <p className="mt-3 text-xs text-muted-foreground">Potential-presence filtering is unavailable right now; all life-list species remain available.</p>
      )}
      {!region && (
        <p className="mt-3 text-xs text-muted-foreground">Open Trip Settings to filter the list to species potentially present for that region and timeframe.</p>
      )}

      <div className="mt-4 max-h-[26rem] overflow-auto rounded-lg border border-border lg:max-h-[calc(100vh-20rem)]">
        {isLoading && <LoadingState inline label="Loading taxonomy…" />}
        {isError && <EmptyState inline variant="destructive" title="Could not load taxonomy" onRetry={() => refetch()} />}
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="w-20 px-3 py-2 font-semibold">Include</th>
                <th className="px-3 py-2">{sortLabel("name", "Common name")}</th>
                <th className="hidden px-3 py-2 sm:table-cell">{sortLabel("sciName", "Scientific name")}</th>
                <th className="hidden px-3 py-2 md:table-cell">{sortLabel("order", "Taxonomic order")}</th>
              </tr>
            </thead>
            <tbody>
              {isTaxonomicView && familyGroups.length > 1 && (
                <tr className="sticky top-8 z-10 bg-card">
                  <td colSpan={4} className="border-b border-border px-3 py-2 text-right">
                    <Button type="button" variant="link" className="mr-3 h-auto p-0 text-xs" onClick={() => setAllFamiliesCollapsed(false)}>Expand all</Button>
                    <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setAllFamiliesCollapsed(true)}>Collapse all</Button>
                  </td>
                </tr>
              )}
              {(isTaxonomicView ? familyGroups.flatMap((group) => {
                const isCollapsed = collapsedFamilies.has(group.key);
                const selectedCount = group.species.filter((taxon) => exceptionSet.has(taxon.code)).length;
                return [
                  <tr key={`family-${group.key}`} className="border-t border-border bg-muted/50">
                    <td colSpan={4} className="px-3 py-2">
                      <button type="button" onClick={() => toggleFamily(group.key)} className="flex w-full items-center gap-2 text-left">
                        <span className="text-xs text-muted-foreground">{isCollapsed ? "▸" : "▾"}</span>
                        <span className="font-semibold text-foreground">{group.name}</span>
                        {group.sciName && <span className="hidden text-xs italic text-muted-foreground sm:inline">{group.sciName}</span>}
                        <span className="ml-auto text-xs text-muted-foreground">{group.species.length} species{selectedCount ? ` · ${selectedCount} included` : ""}</span>
                      </button>
                    </td>
                  </tr>,
                  ...(isCollapsed ? [] : group.species.map((taxon) => speciesRow(taxon))),
                ];
              }) : species.map((taxon) => speciesRow(taxon)))}
              {species.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No matching life-list species.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );

  function speciesRow(taxon: Taxon) {
                const included = exceptionSet.has(taxon.code);
                return (
                  <tr key={taxon.code} className="border-t border-border">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={included}
                        aria-label={`${included ? "Exclude" : "Include"} ${taxon.name}`}
                        disabled={setExceptionsMutation.isPending}
                        onClick={() => toggle(taxon.code)}
                        className={`flex size-5 items-center justify-center rounded border ${included ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}
                      >
                        {included && <Check className="size-3.5" />}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground">{taxon.name}<span className="mt-0.5 block text-xs font-normal italic text-muted-foreground sm:hidden">{taxon.sciName}</span></td>
                    <td className="hidden px-3 py-2 italic text-muted-foreground sm:table-cell">{taxon.sciName}</td>
                    <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">{taxon.order}</td>
                  </tr>
                );
  }
}
