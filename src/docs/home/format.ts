const units = ["B", "KB", "MB", "GB", "TB", "PB"];

export function formatBytes(value = 0, digits = 2, space = "") {
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(digits)}${space}${units[unit]}`;
}

/** Use one unit and enough precision to distinguish every tick on an axis. */
export function formatTrafficTicks(ticks: number[], suffix = ''): string[] {
  if (!ticks.length) return [];
  const values = ticks.map(value => Number.isFinite(value) ? value : 0);
  const maximum = Math.max(...values.map(Math.abs));
  const unit = Math.min(units.length - 1, maximum >= 1024 ? Math.floor(Math.log(maximum) / Math.log(1024)) : 0);
  const scale = 1024 ** unit;
  const distinct = [...new Set(values)].sort((a, b) => a - b);
  let step = Infinity;
  for (let i = 1; i < distinct.length; i++) step = Math.min(step, (distinct[i] - distinct[i - 1]) / scale);
  let digits = Number.isFinite(step) ? Math.max(0, Math.ceil(-Math.log10(step))) : 0;
  const label = (value: number) => value === 0 ? '0' : digits > 6
    ? (value / scale).toExponential(Math.min(15, Math.max(0, Math.ceil(Math.log10(maximum / scale / step)))))
    : (value / scale).toFixed(digits);
  // Floating point spacing near a unit boundary can require one extra digit.
  while (digits < 6 && new Set(distinct.map(label)).size < distinct.length) digits++;
  return values.map(value => `${label(value)} ${units[unit]}${suffix}`);
}
