import { MIN_SPECIES_OBSERVATIONS, MIN_TARGET_CHECKLISTS } from "lib/config";
import { computeFrequency, getMonthRange, sumMonths } from "lib/targets";
import useHotspotTargets from "hooks/useHotspotTargets";

type Props = {
  hotspotIds: string[];
  startMonth?: number;
  endMonth?: number;
  enabled: boolean;
};

export default function useSavedHotspotTargets({ hotspotIds, startMonth, endMonth, enabled }: Props) {
  const { hotspots, namesByCode, isLoading, isError, refetch } = useHotspotTargets(hotspotIds, enabled);
  const months = getMonthRange(startMonth || 1, endMonth || 12);
  const samples = hotspots.reduce(
    (totals, hotspot) => totals.map((total, index) => total + (hotspot.samples[index] || 0)),
    Array(12).fill(0) as number[]
  );
  const observationsByCode = new Map<string, number[]>();

  for (const hotspot of hotspots) {
    for (const [code, observations] of hotspot.obsByCode) {
      const totals = observationsByCode.get(code) || Array(12).fill(0);
      observationsByCode.set(code, totals.map((total, index) => total + (observations[index] || 0)));
    }
  }

  const items = [...observationsByCode].flatMap(([code, observations]) => {
    if (
      sumMonths(observations, months) < MIN_SPECIES_OBSERVATIONS ||
      sumMonths(samples, months) < MIN_TARGET_CHECKLISTS
    ) {
      return [];
    }
    return [{ code, name: namesByCode.get(code) || code, observations }];
  });

  return {
    items: items
      .map(({ code, name, observations }) => ({
        code,
        name,
        obs: observations,
        frequency: computeFrequency(observations, samples, months),
      }))
      .sort((a, b) => b.frequency - a.frequency),
    samples,
    isLoading,
    isError,
    refetch,
  };
}
