import {
  HARD_TO_FIND_OTHER_DAY_MAX_FREQUENCY,
  HOTSPOT_TARGET_CUTOFF,
  MIN_SPECIES_OBSERVATIONS,
  MIN_TARGET_CHECKLISTS,
  TARGET_ADVANTAGE_MIN_LEAD_PERCENTAGE_POINTS,
  TARGET_ADVANTAGE_MIN_LEAD_RATIO,
} from "lib/config";

export function getMonthRange(startMonth: number, endMonth: number): number[] {
  const months: number[] = [];
  let m = startMonth;
  while (true) {
    months.push(m);
    if (m === endMonth) break;
    m = m === 12 ? 1 : m + 1;
  }
  return months;
}

export function computeFrequency(obs: number[], samples: number[], months: number[]): number {
  const totalObs = months.reduce((sum, m) => sum + (obs[m - 1] || 0), 0);
  const totalSamples = months.reduce((sum, m) => sum + (samples[m - 1] || 0), 0);
  if (totalSamples === 0) return 0;
  return Number(((totalObs / totalSamples) * 100).toFixed(1));
}

export type HotspotTargetCounts = {
  hotspotId: string;
  samples: number[];
  obsByCode: Map<string, number[]>;
};

function sumMonths(counts: number[], months: number[]): number {
  return months.reduce((sum, m) => sum + (counts[m - 1] || 0), 0);
}

export type HotspotSpeciesFrequency = {
  hotspotId: string;
  frequency: number;
  observations: number;
  checklists: number;
};

export type DaySpeciesOpportunity = {
  frequency: number;
  records: HotspotSpeciesFrequency[];
};

export type DayTargetOpportunities = {
  hasScheduledHotspots: boolean;
  hasQualifiedHotspots: boolean;
  byCode: Map<string, DaySpeciesOpportunity>;
};

export type KeySpeciesOpportunity = {
  frequency: number;
  hotspotIds: string[];
  hardToFindElsewhere: boolean;
  materiallyBetterToday: boolean;
};

export function getDayTargetOpportunities(
  hotspotsById: Map<string, HotspotTargetCounts>,
  hotspotIds: string[],
  months: number[]
): DayTargetOpportunities {
  const recordsByCode = new Map<string, HotspotSpeciesFrequency[]>();
  const hasScheduledHotspots = hotspotIds.length > 0;
  let hasQualifiedHotspots = false;

  for (const hotspotId of hotspotIds) {
    const hotspot = hotspotsById.get(hotspotId);
    if (!hotspot) {
      continue;
    }

    const checklists = sumMonths(hotspot.samples, months);
    if (checklists < MIN_TARGET_CHECKLISTS) continue;
    hasQualifiedHotspots = true;

    for (const [code, obs] of hotspot.obsByCode) {
      const records = recordsByCode.get(code) || [];
      records.push({
        hotspotId,
        frequency: computeFrequency(obs, hotspot.samples, months),
        observations: sumMonths(obs, months),
        checklists,
      });
      recordsByCode.set(code, records);
    }
  }

  const byCode = new Map<string, DaySpeciesOpportunity>();
  for (const [code, records] of recordsByCode) {
    byCode.set(code, { frequency: Math.max(...records.map((it) => it.frequency)), records });
  }

  return { hasScheduledHotspots, hasQualifiedHotspots, byCode };
}

export function getKeySpeciesOpportunities(
  opportunitiesByDay: DayTargetOpportunities[]
): Map<number, Map<string, KeySpeciesOpportunity>> {
  return new Map(
    opportunitiesByDay.map((today, dayIndex) => {
      const otherDays = opportunitiesByDay.filter(
        (day, index) => index !== dayIndex && day.hasScheduledHotspots && day.hasQualifiedHotspots
      );
      const flagsByCode = new Map<string, KeySpeciesOpportunity>();

      if (!today.hasQualifiedHotspots || !otherDays.length) {
        return [dayIndex, flagsByCode];
      }

      for (const [code, opportunity] of today.byCode) {
        const eligibleRecords = opportunity.records.filter(
          (it) =>
            it.frequency >= HOTSPOT_TARGET_CUTOFF &&
            it.observations >= MIN_SPECIES_OBSERVATIONS &&
            it.checklists >= MIN_TARGET_CHECKLISTS
        );
        if (!eligibleRecords.length) continue;

        const frequency = Math.max(...eligibleRecords.map((it) => it.frequency));
        const hotspotIds = eligibleRecords.filter((it) => it.frequency === frequency).map((it) => it.hotspotId);
        const bestOtherDayFrequency = Math.max(...otherDays.map((day) => day.byCode.get(code)?.frequency ?? 0));
        const hardToFindElsewhere =
          frequency >= bestOtherDayFrequency && bestOtherDayFrequency < HARD_TO_FIND_OTHER_DAY_MAX_FREQUENCY;
        const materiallyBetterToday =
          frequency - bestOtherDayFrequency >= TARGET_ADVANTAGE_MIN_LEAD_PERCENTAGE_POINTS &&
          frequency >= bestOtherDayFrequency * TARGET_ADVANTAGE_MIN_LEAD_RATIO;

        if (hardToFindElsewhere || materiallyBetterToday) {
          flagsByCode.set(code, { frequency, hotspotIds, hardToFindElsewhere, materiallyBetterToday });
        }
      }

      return [dayIndex, flagsByCode];
    })
  );
}

export type BestHotspots = {
  hotspotIds: string[];
  frequency: number;
};

export function bestHotspotsByCode(hotspots: HotspotTargetCounts[], months: number[]): Map<string, BestHotspots> {
  const recordsByCode = new Map<string, { hotspotId: string; frequency: number }[]>();

  for (const hotspot of hotspots) {
    for (const [code, obs] of hotspot.obsByCode) {
      if (
        sumMonths(obs, months) < MIN_SPECIES_OBSERVATIONS ||
        sumMonths(hotspot.samples, months) < MIN_TARGET_CHECKLISTS
      ) {
        continue;
      }
      const records = recordsByCode.get(code) || [];
      records.push({
        hotspotId: hotspot.hotspotId,
        frequency: computeFrequency(obs, hotspot.samples, months),
      });
      recordsByCode.set(code, records);
    }
  }

  const best = new Map<string, BestHotspots>();

  for (const [code, records] of recordsByCode) {
    const topFrequency = Math.max(...records.map((it) => it.frequency));
    const leaders = records.filter((it) => it.frequency === topFrequency);
    if (leaders.length !== 1) continue;
    const nextBestFrequency = Math.max(...records.filter((it) => it.frequency < topFrequency).map((it) => it.frequency));
    const hasMaterialLead =
      topFrequency - nextBestFrequency >= TARGET_ADVANTAGE_MIN_LEAD_PERCENTAGE_POINTS &&
      topFrequency >= nextBestFrequency * TARGET_ADVANTAGE_MIN_LEAD_RATIO;

    if (!hasMaterialLead) continue;
    best.set(code, { hotspotIds: leaders.map((it) => it.hotspotId), frequency: topFrequency });
  }

  return best;
}
