const units = ["B", "KB", "MB", "GB", "TB", "PB"];

export function formatBytes(value = 0, digits = 2, space = "") {
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(digits)}${space}${units[unit]}`;
}
