import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EvidenceAsset, NumericMetric, ScenarioProfile } from "../types";
import { formatMetric, formatNumber } from "../utils/format";
import { MetricCard } from "./MetricCard";

interface ScenarioPageProps {
  scenario: ScenarioProfile;
}

const colors = ["#2d6f55", "#c18432", "#17633d", "#8f6f3f", "#a64231", "#6a4f34", "#d6b168"];

export function ScenarioPage({ scenario }: ScenarioPageProps) {
  const { metrics } = scenario;
  const visibleEvidence = scenario.evidence.filter((asset) => asset.src);

  const devToolsFrameData = metrics.devTools.frames.map((frame) => ({
    frame: `F${frame.frame}`,
    UI: frame.uiMs,
    Raster: frame.rasterMs,
    Total: frame.totalMs,
    "Vsync overhead": frame.vsyncOverheadMs,
    "120 Hz budget": 8.33,
    "60 Hz budget": 16.67,
  }));

  const memorySummary = [
    { name: "RSS", value: metrics.devTools.rssMb },
    { name: "Allocated", value: metrics.devTools.allocatedMb },
    { name: "Dart heap", value: metrics.devTools.dartHeapMb },
    { name: "Dart/Flutter", value: metrics.devTools.dartFlutterMb },
  ].filter((item): item is { name: string; value: number } => item.value !== null && item.value !== undefined);

  const gpuPercentiles = [
    { name: "P50", frame: metrics.gpu.p50Ms.value, raster: metrics.gpu.gpuP50Ms.value },
    { name: "P90", frame: metrics.gpu.p90Ms.value, raster: metrics.gpu.gpuP90Ms.value },
    { name: "P95", frame: metrics.gpu.p95Ms.value, raster: metrics.gpu.gpuP95Ms.value },
    { name: "P99", frame: metrics.gpu.p99Ms.value, raster: metrics.gpu.gpuP99Ms.value },
  ].map((item) => ({
    name: item.name,
    frame: item.frame ?? 0,
    raster: item.raster ?? 0,
  }));

  const budgetData = [
    { name: "Frames >120 Hz", value: metrics.devTools.framesOver120HzBudget },
    { name: "Frames >60 Hz", value: metrics.devTools.framesOver60HzBudget },
    { name: "Raster >120 Hz", value: metrics.devTools.rasterOver120HzBudget },
  ].filter((item): item is { name: string; value: number } => item.value !== null && item.value !== undefined);

  const cpuSummary = [
    { name: "Samples", value: metrics.devTools.cpuSampleCount },
    { name: "Duration ms", value: metrics.devTools.cpuDurationMs },
    { name: "Stack depth", value: metrics.devTools.cpuStackDepth },
  ].filter((item): item is { name: string; value: number } => item.value !== null && item.value !== undefined);

  const developerModeData = [
    { name: "FPS", value: metrics.devTools.developerFpsAverage },
    { name: "CPU %", value: metrics.devTools.developerCpuPercent },
    { name: "GPU %", value: metrics.devTools.developerGpuPercent },
  ].filter((item): item is { name: string; value: number } => item.value !== null && item.value !== undefined);
  const powerBreakdown = [
    { name: "Total app", value: metrics.power.appEstimatedMah.value },
    { name: "CPU", value: metrics.power.appCpuMah.value },
    { name: "WiFi", value: metrics.power.appWifiMah.value },
    { name: "Foreground", value: metrics.power.appForegroundMah.value },
    { name: "Background", value: metrics.power.appBackgroundMah.value },
  ].filter((item): item is { name: string; value: number } => item.value !== null && item.value !== undefined);
  const hasDerivedMemory = scenario.order >= 3;

  return (
    <main className="page-shell">
      <section className="scenario-header scenario-header--dense">
        <div>
          <div className="scenario-header__title">
            <p className="eyebrow">Scenario {scenario.order}</p>
          </div>
          <h1>{scenario.title}</h1>
          <p>{scenario.description}</p>
        </div>
        <div className="scenario-header__context">
          <strong>Measurement context</strong>
          <p>{scenario.measurementContext}</p>
        </div>
      </section>

      <section className="workflow-strip">
        {scenario.sequence.map((step, index) => (
          <article key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{step}</p>
          </article>
        ))}
      </section>

      <section className="metric-grid metric-grid--six">
        <MetricCard
          label="DevTools RSS"
          metric={simpleMetric(metrics.devTools.rssMb, "MB", memorySource(scenario.order, "rss"))}
          tone="blue"
        />
        <MetricCard label="Dart heap" metric={simpleMetric(metrics.devTools.dartHeapMb, "MB", "DevTools Memory")} tone="green" />
        <MetricCard
          label="Allocated"
          metric={simpleMetric(metrics.devTools.allocatedMb, "MB", memorySource(scenario.order, "allocated"))}
          tone="teal"
        />
        <MetricCard label="Avg frame" metric={simpleMetric(metrics.devTools.averageFrameMs, "ms", "DevTools Performance")} tone="amber" />
        <MetricCard label="CPU samples" metric={simpleMetric(metrics.devTools.cpuSampleCount, "count", "DevTools CPU Profiler")} tone="purple" />
        <MetricCard label="Developer FPS" metric={simpleMetric(metrics.devTools.developerFpsAverage, "FPS", "Phone developer mode")} tone="red" />
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GPU rendering analysis</p>
              <h2>DevTools frame timing</h2>
            </div>
            <span className="pipeline-pill">{metrics.devTools.displayRefreshRateHz ?? "N/A"} Hz display</span>
          </div>
          <div className="chart-frame">
            {devToolsFrameData.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={devToolsFrameData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="frame" />
                  <YAxis unit=" ms" />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(3)} ms`, ""]} />
                  <Legend />
                  <Bar dataKey="UI" stackId="time" fill="#d6b168" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Raster" stackId="time" fill="#2d6f55" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Vsync overhead" stackId="time" fill="#8f6f3f" radius={[5, 5, 0, 0]} />
                  <Line dataKey="120 Hz budget" stroke="#a64231" strokeDasharray="4 4" dot={false} />
                  <Line dataKey="60 Hz budget" stroke="#17633d" strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="mini-metrics">
            <span>Frames: {formatOptional(metrics.devTools.performanceRecordingFrames, "count")}</span>
            <span>Avg frame: {formatOptional(metrics.devTools.averageFrameMs, "ms", 3)}</span>
            <span>P95 frame: {formatOptional(metrics.devTools.p95FrameMs, "ms", 3)}</span>
            <span>Max frame: {formatOptional(metrics.devTools.maxFrameMs, "ms", 3)}</span>
          </div>
          <p className="interpretation">{scenario.interpretation.gpu}</p>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Memory management</p>
              <h2>DevTools memory summary</h2>
            </div>
          </div>
          <div className="chart-frame">
            {memorySummary.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={memorySummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis unit=" MB" />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} MB`, ""]} />
                  <Bar dataKey="value" fill="#2d6f55" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
          {hasDerivedMemory ? (
            <p className="chart-note">RSS and Allocated use derived values for this scenario, based on comparable DevTools memory evidence.</p>
          ) : null}
          <p className="interpretation">{scenario.interpretation.memory}</p>
        </article>
      </section>

      <section className="section-grid section-grid--three">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Memory classes</p>
              <h2>Top Dart classes</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            {metrics.devTools.memoryClasses.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={metrics.devTools.memoryClasses.slice(0, 7)} layout="vertical" margin={{ left: 54 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit=" KB" />
                  <YAxis dataKey="className" type="category" width={128} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} KB`, "Total size"]} />
                  <Bar dataKey="totalSizeKb" fill="#17633d" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Frame budget</p>
              <h2>Target misses</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            {budgetData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#a64231" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Phone developer mode</p>
              <h2>GPU overlay snapshot</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            {developerModeData.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={developerModeData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={2}>
                    {developerModeData.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CPU and threading</p>
              <h2>DevTools execution lanes</h2>
            </div>
            <span className="pipeline-pill">{formatOptional(metrics.devTools.cpuSampleCount, "count")} samples</span>
          </div>
          <div className="split-panel">
            <div className="chart-frame chart-frame--compact">
              {cpuSummary.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={cpuSummary}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#c18432" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </div>
            <div className="detail-list">
              {metrics.threads.notableGroups.length ? (
                metrics.threads.notableGroups.map((group) => <p key={group}>{group}</p>)
              ) : (
                <p>No DevTools threading evidence has been added yet.</p>
              )}
            </div>
          </div>
          <p className="interpretation">{scenario.interpretation.threads}</p>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CPU profiler</p>
              <h2>Hot paths</h2>
            </div>
            <span className="pipeline-pill">{formatOptional(metrics.devTools.cpuDurationMs, "ms", 1)}</span>
          </div>
          <div className="chart-frame">
            {metrics.devTools.cpuHotspots.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.devTools.cpuHotspots} layout="vertical" margin={{ left: 72 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" unit="%" />
                  <YAxis dataKey="name" type="category" width={168} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "Samples"]} />
                  <Bar dataKey="percent" fill="#6a4f34" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
          <p className="interpretation">{scenario.interpretation.cpu}</p>
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GPU rendering</p>
              <h2>Frame and raster percentiles</h2>
            </div>
            <span className="pipeline-pill">{metrics.gpu.pipeline}</span>
          </div>
          <div className="chart-frame">
            {metrics.gpu.p50Ms.value !== null ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gpuPercentiles}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis unit=" ms" />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(3)} ms`, ""]} />
                  <Legend />
                  <Bar dataKey="frame" fill="#2d6f55" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="raster" fill="#c18432" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Overdrawing</p>
              <h2>Developer-option evidence</h2>
            </div>
            <span className={`status-pill status-pill--${metrics.overdraw.status === "measured" ? "complete" : "pending"}`}>
              {metrics.overdraw.status === "measured" ? "Evidence available" : "Pending evidence"}
            </span>
          </div>
          <p className="interpretation">{scenario.interpretation.overdraw}</p>
          <div className="detail-list">
            {metrics.overdraw.evidence.length ? (
              metrics.overdraw.evidence.map((item) => <p key={item}>{item}</p>)
            ) : (
              <p>No overdraw evidence has been added yet.</p>
            )}
          </div>
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Power analysis</p>
              <h2>ADB batterystats energy model</h2>
            </div>
            <span className="pipeline-pill">{metrics.power.canTrustPowerProfile ? "Trusted power profile" : "Pending capture"}</span>
          </div>
          <div className="metric-grid metric-grid--four">
            <MetricCard label="App energy" metric={metrics.power.appEstimatedMah} tone="green" />
            <MetricCard label="CPU energy" metric={metrics.power.appCpuMah} tone="amber" />
            <MetricCard label="WiFi energy" metric={metrics.power.appWifiMah} tone="teal" />
            <MetricCard label="Battery capacity" metric={metrics.power.estimatedBatteryCapacityMah} tone="purple" />
          </div>
          <p className="interpretation">{scenario.interpretation.power}</p>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Power breakdown</p>
              <h2>UID-level mAh attribution</h2>
            </div>
            <span className="pipeline-pill">{metrics.power.screenOnTime}</span>
          </div>
          <div className="chart-frame chart-frame--compact">
            {powerBreakdown.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={powerBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis unit=" mAh" />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(4)} mAh`, ""]} />
                  <Bar dataKey="value" fill="#17633d" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="detail-list detail-list--columns">
            <p>Total run time: {metrics.power.totalRunTime}</p>
            <p>Screen on: {metrics.power.screenOnTime}</p>
            <p>Foreground time: {metrics.power.appForegroundTime}</p>
            <p>Device drain: {formatMetric(metrics.power.actualDrainMah, 3)}</p>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence gallery</p>
            <h2>Screenshots and captured views</h2>
          </div>
        </div>
        <div className="evidence-grid">
          {visibleEvidence.length ? visibleEvidence.map((asset) => <EvidenceCard key={asset.title} asset={asset} />) : <EmptyEvidence />}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Findings</p>
            <h2>Strengths and weaknesses</h2>
          </div>
        </div>
        <div className="findings-grid findings-grid--two">
          <FindingColumn title="Strengths" items={scenario.findings.strengths} />
          <FindingColumn title="Weaknesses" items={scenario.findings.weaknesses} />
        </div>
      </section>
    </main>
  );
}

function EvidenceCard({ asset }: { asset: EvidenceAsset }) {
  return (
    <article className="evidence-card">
      <div className="evidence-card__image">
        {asset.src ? <img src={asset.src} alt={asset.title} /> : null}
      </div>
      <div>
        <span>{asset.kind}</span>
        <h3>{asset.title}</h3>
        <p>{asset.caption}</p>
      </div>
    </article>
  );
}

function FindingColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="finding-column">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function EmptyChart() {
  return <div className="empty-state">Not available in the current DevTools/developer-mode evidence.</div>;
}

function EmptyEvidence() {
  return <div className="empty-state">No screenshots have been added for this scenario yet.</div>;
}

function simpleMetric(value: number | null | undefined, unit: string, source?: string, status: NumericMetric["status"] = "measured"): NumericMetric {
  return value === null || value === undefined ? { value: null, unit, status: "not-measured" } : { value, unit, status, source };
}

function memorySource(order: number, metric: "rss" | "allocated") {
  if (order === 3 && metric === "rss") {
    return "Derived from Scenario 2 RSS/Dart heap ratio";
  }
  if (order === 4 && metric === "rss") {
    return "Derived from Scenario 2 comparable workspace memory";
  }
  if (order >= 3 && metric === "allocated") {
    return "Derived from Dart heap and observed allocated margin";
  }
  return "DevTools Memory";
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
