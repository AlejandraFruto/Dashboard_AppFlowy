import type { NumericMetric } from "../types";
import { formatMetric } from "../utils/format";

interface MetricCardProps {
  label: string;
  metric: NumericMetric;
  description?: string;
  tone?: "default" | "blue" | "teal" | "green" | "amber" | "red" | "purple";
}

export function MetricCard({ label, metric, description, tone = "default" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value">{formatMetric(metric)}</div>
      {description ? <p>{description}</p> : null}
      {metric.source ? <span className="metric-card__source">{metric.source}</span> : null}
    </article>
  );
}
