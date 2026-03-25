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
