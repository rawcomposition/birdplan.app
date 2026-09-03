import { MIN_SPECIES_OBSERVATIONS } from "lib/config";

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

export type BestHotspots = {
  hotspotIds: string[];
  frequency: number;
};

export function bestHotspotsByCode(hotspots: HotspotTargetCounts[], months: number[]): Map<string, BestHotspots> {
  const recordsByCode = new Map<string, { hotspotId: string; frequency: number }[]>();

  for (const hotspot of hotspots) {
    for (const [code, obs] of hotspot.obsByCode) {
      if (sumMonths(obs, months) < MIN_SPECIES_OBSERVATIONS) continue;
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
    const frequency = Math.max(...records.map((it) => it.frequency));
    const leaders = records.filter((it) => it.frequency === frequency);
    if (leaders.length === records.length) continue;
    best.set(code, { hotspotIds: leaders.map((it) => it.hotspotId), frequency });
  }

  return best;
}
