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

export function bestHotspotsByCode(hotspots: HotspotTargetCounts[], months: number[]): Map<string, string[]> {
  const recordsByCode = new Map<string, { hotspotId: string; frequency: number; observations: number }[]>();

  for (const hotspot of hotspots) {
    for (const [code, obs] of hotspot.obsByCode) {
      const observations = sumMonths(obs, months);
      if (observations < MIN_SPECIES_OBSERVATIONS) continue;
      const records = recordsByCode.get(code) || [];
      records.push({
        hotspotId: hotspot.hotspotId,
        frequency: computeFrequency(obs, hotspot.samples, months),
        observations,
      });
      recordsByCode.set(code, records);
    }
  }

  const best = new Map<string, string[]>();

  for (const [code, records] of recordsByCode) {
    const topFrequency = Math.max(...records.map((it) => it.frequency));
    const leaders = records.filter((it) => it.frequency === topFrequency);
    if (leaders.length === records.length) continue;
    best.set(
      code,
      leaders.map((it) => it.hotspotId)
    );
  }

  return best;
}
