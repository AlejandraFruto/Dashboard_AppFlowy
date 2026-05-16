import type { NumericMetric } from "../types";

export const notMeasured = "Not available";

export function kbToMb(value: number): number {
  return value / 1024;
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 === 0 ? 0 : digits,
  }).format(value);
}

export function formatMetric(metric: NumericMetric, digits = 1): string {
  if (metric.value === null || metric.status !== "measured") {
    return metric.status === "not-available" ? "Not available" : notMeasured;
  }

  if (metric.unit === "KB") {
    return `${formatNumber(kbToMb(metric.value), digits)} MB`;
  }

  if (metric.unit === "count") {
    return formatNumber(metric.value, 0);
  }

  return `${formatNumber(metric.value, digits)} ${metric.unit}`;
}

export function metricToChartValue(metric: NumericMetric): number | null {
  if (metric.value === null || metric.status !== "measured") {
    return null;
  }
  return metric.unit === "KB" ? kbToMb(metric.value) : metric.value;
}
