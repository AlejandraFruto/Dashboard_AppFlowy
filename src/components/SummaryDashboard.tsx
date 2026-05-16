import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { appMeasurementNote, scenarios } from "../data/scenarios";
import type { NumericMetric, ScenarioProfile } from "../types";
import { formatNumber } from "../utils/format";
import { MetricCard } from "./MetricCard";

const chartColors = ["#2d6f55", "#c18432", "#17633d", "#8f6f3f", "#a64231", "#6a4f34", "#d6b168"];

export function SummaryDashboard() {
  const complete = scenarios.filter((scenario) => scenario.status === "complete");
  const latest = complete[complete.length - 1];

  const memoryChartData = scenarios.map((scenario) => ({
    name: `S${scenario.order}`,
    RSS: scenario.metrics.devTools.rssMb,
    Allocated: scenario.metrics.devTools.allocatedMb,
    "Dart heap": scenario.metrics.devTools.dartHeapMb,
  }));

  const frameChartData = scenarios.map((scenario) => ({
    name: `S${scenario.order}`,
    "Average frame": scenario.metrics.devTools.averageFrameMs,
    "P95 frame": scenario.metrics.devTools.p95FrameMs,
    "Max frame": scenario.metrics.devTools.maxFrameMs,
  }));

  const budgetData = scenarios.map((scenario) => ({
    name: `S${scenario.order}`,
    "> 120 Hz budget": scenario.metrics.devTools.framesOver120HzBudget,
    "> 60 Hz budget": scenario.metrics.devTools.framesOver60HzBudget,
    "Raster > 120 Hz": scenario.metrics.devTools.rasterOver120HzBudget,
  }));

  const cpuData = scenarios.map((scenario) => ({
    name: `S${scenario.order}`,
    Samples: scenario.metrics.devTools.cpuSampleCount,
    "Duration (s)": scenario.metrics.devTools.cpuDurationMs ? scenario.metrics.devTools.cpuDurationMs / 1000 : null,
  }));

  const classData = latest?.metrics.devTools.memoryClasses.slice(0, 8) ?? [];

  const radarData = latest
    ? [
        { axis: "RSS", value: clampScore((latest.metrics.devTools.rssMb ?? 0) / 5) },
        { axis: "Dart heap", value: clampScore((latest.metrics.devTools.dartHeapMb ?? 0) * 1.6) },
        { axis: "Frame avg", value: clampScore((latest.metrics.devTools.averageFrameMs ?? 0) * 7) },
        { axis: "P95 frame", value: clampScore((latest.metrics.devTools.p95FrameMs ?? 0) * 5) },
        { axis: "CPU samples", value: clampScore((latest.metrics.devTools.cpuSampleCount ?? 0) / 35) },
      ]
    : [];

  return (
    <main className="page-shell">
      <section className="hero-panel hero-panel--dashboard">
        <div>
          <p className="eyebrow">Restored report chamber</p>
          <h1>Realm map of AppFlowy performance</h1>
          <p>{appMeasurementNote}</p>
        </div>
        <div className="hero-scorecard">
          <span>Recovered parts</span>
          <strong>{scenarios.length}</strong>
          <small>Scenarios restored from DevTools exports and phone screenshots</small>
        </div>
      </section>

      {latest ? (
        <section className="metric-grid metric-grid--six">
          <MetricCard
            label="Latest RSS"
            metric={measuredMetric(latest.metrics.devTools.rssMb, "MB", memorySource(latest, "rss"))}
            tone="blue"
          />
          <MetricCard label="Dart heap" metric={measuredMetric(latest.metrics.devTools.dartHeapMb, "MB", "DevTools Memory")} tone="green" />
          <MetricCard label="Avg frame" metric={measuredMetric(latest.metrics.devTools.averageFrameMs, "ms", "DevTools Performance")} tone="teal" />
          <MetricCard label="P95 frame" metric={measuredMetric(latest.metrics.devTools.p95FrameMs, "ms", "DevTools Performance")} tone="amber" />
          <MetricCard label="Frames over 120 Hz" metric={measuredMetric(latest.metrics.devTools.framesOver120HzBudget, "count", "DevTools Performance")} tone="red" />
          <MetricCard label="CPU samples" metric={measuredMetric(latest.metrics.devTools.cpuSampleCount, "count", "DevTools CPU Profiler")} tone="purple" />
        </section>
      ) : null}

      <section className="section-grid section-grid--wide-left">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Scenario comparison</p>
              <h2>DevTools memory by scenario</h2>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={memoryChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit=" MB" />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} MB`, ""]} />
                <Legend />
                <Bar dataKey="RSS" fill="#2d6f55" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Allocated" fill="#c18432" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Dart heap" fill="#17633d" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">Scenario 3 and Scenario 4 RSS/Allocated values use derived memory values based on comparable DevTools evidence.</p>
        </article>

        <article className="panel panel--blue">
          <div className="section-heading">
            <div>
              <p className="eyebrow eyebrow--light">Evidence</p>
              <h2>Accepted data sources</h2>
            </div>
          </div>
          <div className="source-stack">
            <span>Flutter DevTools JSON exports</span>
            <span>Flutter DevTools CSV snapshots</span>
            <span>Performance, memory, and CPU profiler screenshots</span>
            <span>Flutter Inspector screenshots</span>
            <span>Android developer-mode GPU and overdraw captures</span>
          </div>
        </article>
      </section>

      <section className="section-grid section-grid--three">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Frame timing</p>
              <h2>Average, P95, and max frame</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={frameChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit=" ms" />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(3)} ms`, ""]} />
                <Legend />
                <Area type="monotone" dataKey="Average frame" stroke="#2d6f55" fill="#dfeec7" />
                <Area type="monotone" dataKey="P95 frame" stroke="#c18432" fill="#f2d18e" />
                <Line dataKey="Max frame" stroke="#a64231" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Frame budget</p>
              <h2>Frames above target</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="> 120 Hz budget" fill="#a64231" radius={[5, 5, 0, 0]} />
                <Bar dataKey="> 60 Hz budget" fill="#c18432" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Raster > 120 Hz" fill="#6a4f34" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Latest scenario</p>
              <h2>Relative pressure radar</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar dataKey="value" stroke="#17633d" fill="#17633d" fillOpacity={0.28} />
                <Tooltip formatter={(value) => [formatNumber(Number(value), 1), "relative score"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CPU profiler</p>
              <h2>Samples and capture duration</h2>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" unit=" s" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Samples" fill="#6a4f34" radius={[5, 5, 0, 0]} />
                <Bar yAxisId="right" dataKey="Duration (s)" fill="#2d6f55" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Memory classes</p>
              <h2>Latest top Dart classes</h2>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={classData} dataKey="totalSizeKb" nameKey="className" innerRadius={64} outerRadius={102} paddingAngle={2}>
                  {classData.map((entry, index) => (
                    <Cell key={entry.className} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} KB`, "Total size"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cross-scenario table</p>
            <h2>DevTools and developer-mode comparative metrics</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                {scenarios.map((scenario) => (
                  <th key={scenario.id}>
                    <span>{scenario.shortTitle}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {scenarios.map((scenario) => (
                    <td key={scenario.id}>{row.read(scenario)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const comparisonRows: Array<{ label: string; read: (scenario: ScenarioProfile) => string }> = [
  { label: "RSS", read: (scenario) => formatMemoryValue(scenario, "rss") },
  { label: "Allocated", read: (scenario) => formatMemoryValue(scenario, "allocated") },
  { label: "Dart heap", read: (scenario) => formatOptional(scenario.metrics.devTools.dartHeapMb, "MB") },
  { label: "Frames captured", read: (scenario) => formatOptional(scenario.metrics.devTools.performanceRecordingFrames, "count") },
  { label: "Average frame", read: (scenario) => formatOptional(scenario.metrics.devTools.averageFrameMs, "ms", 3) },
  { label: "P95 frame", read: (scenario) => formatOptional(scenario.metrics.devTools.p95FrameMs, "ms", 3) },
  { label: "Max frame", read: (scenario) => formatOptional(scenario.metrics.devTools.maxFrameMs, "ms", 3) },
  { label: "Frames > 120 Hz budget", read: (scenario) => formatOptional(scenario.metrics.devTools.framesOver120HzBudget, "count") },
  { label: "Frames > 60 Hz budget", read: (scenario) => formatOptional(scenario.metrics.devTools.framesOver60HzBudget, "count") },
  { label: "CPU samples", read: (scenario) => formatOptional(scenario.metrics.devTools.cpuSampleCount, "count") },
  { label: "CPU capture duration", read: (scenario) => formatOptional(scenario.metrics.devTools.cpuDurationMs, "ms", 1) },
  { label: "Developer FPS overlay", read: (scenario) => formatOptional(scenario.metrics.devTools.developerFpsAverage, "FPS") },
  { label: "Developer CPU overlay", read: (scenario) => formatOptional(scenario.metrics.devTools.developerCpuPercent, "%") },
  { label: "Developer GPU overlay", read: (scenario) => formatOptional(scenario.metrics.devTools.developerGpuPercent, "%") },
];

function measuredMetric(
  value: number | null | undefined,
  unit: string,
  source?: string,
  status: NumericMetric["status"] = "measured",
): NumericMetric {
  return value === null || value === undefined ? { value: null, unit, status: "not-measured" } : { value, unit, status, source };
}

function formatOptional(value: number | null | undefined, unit: string, digits = 1) {
  if (value === null || value === undefined) {
    return "Not available";
  }
  if (unit === "count") {
    return formatNumber(value, 0);
  }
  return `${formatNumber(value, digits)} ${unit}`;
}

function formatMemoryValue(scenario: ScenarioProfile, metric: "rss" | "allocated") {
  const value = metric === "rss" ? scenario.metrics.devTools.rssMb : scenario.metrics.devTools.allocatedMb;
  return formatOptional(value, "MB");
}

function memorySource(scenario: ScenarioProfile, metric: "rss" | "allocated") {
  if (scenario.order < 3) {
    return "DevTools Memory";
  }
  if (metric === "rss") {
    return "Derived from comparable DevTools memory evidence";
  }
  return "Derived from Dart heap and observed allocated margin";
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}
