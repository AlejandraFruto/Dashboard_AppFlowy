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

const colors = ["#2563eb", "#0891b2", "#16a34a", "#f59e0b", "#e11d48", "#7c3aed", "#475569"];

export function ScenarioPage({ scenario }: ScenarioPageProps) {
  const { metrics } = scenario;

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
        <MetricCard label="DevTools RSS" metric={simpleMetric(metrics.devTools.rssMb, "MB", "DevTools Memory")} tone="blue" />
        <MetricCard label="Dart heap" metric={simpleMetric(metrics.devTools.dartHeapMb, "MB", "DevTools Memory")} tone="green" />
        <MetricCard label="Allocated" metric={simpleMetric(metrics.devTools.allocatedMb, "MB", "DevTools Memory")} tone="teal" />
        <MetricCard label="Avg frame" metric={simpleMetric(metrics.devTools.averageFrameMs, "ms", "DevTools Performance")} tone="amber" />
        <MetricCard label="CPU samples" metric={simpleMetric(metrics.devTools.cpuSampleCount, "count", "DevTools CPU Profiler")} tone="purple" />
        <MetricCard label="Developer FPS" metric={simpleMetric(metrics.devTools.developerFpsAverage, "FPS", "Phone developer mode")} tone="red" />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Inputs</p>
            <h2>Tools and source files</h2>
          </div>
        </div>
        <div className="tag-list">
          {scenario.tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
        <div className="source-list">
          {scenario.sourceFiles.length ? scenario.sourceFiles.map((file) => <code key={file}>{file}</code>) : <span>Not available</span>}
        </div>
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
                  <Bar dataKey="UI" stackId="time" fill="#93c5fd" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Raster" stackId="time" fill="#2563eb" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="Vsync overhead" stackId="time" fill="#c4b5fd" radius={[5, 5, 0, 0]} />
                  <Line dataKey="120 Hz budget" stroke="#e11d48" strokeDasharray="4 4" dot={false} />
                  <Line dataKey="60 Hz budget" stroke="#16a34a" strokeDasharray="4 4" dot={false} />
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
                  <Bar dataKey="value" fill="#0891b2" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
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
                  <Bar dataKey="totalSizeKb" fill="#16a34a" radius={[0, 5, 5, 0]} />
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
                  <Bar dataKey="value" fill="#e11d48" radius={[5, 5, 0, 0]} />
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
                    <Bar dataKey="value" fill="#7c3aed" radius={[5, 5, 0, 0]} />
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
                  <Bar dataKey="percent" fill="#7c3aed" radius={[0, 5, 5, 0]} />
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
                  <Bar dataKey="frame" fill="#2563eb" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="raster" fill="#0891b2" radius={[5, 5, 0, 0]} />
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

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence gallery</p>
            <h2>Screenshots and captured views</h2>
          </div>
        </div>
        <div className="evidence-grid">
          {scenario.evidence.length ? scenario.evidence.map((asset) => <EvidenceCard key={asset.title} asset={asset} />) : <EmptyEvidence />}
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
        {asset.src ? <img src={asset.src} alt={asset.title} /> : <div className="missing-evidence">Image asset pending</div>}
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

function simpleMetric(value: number | null | undefined, unit: string, source?: string): NumericMetric {
  return value === null || value === undefined ? { value: null, unit, status: "not-measured" } : { value, unit, status: "measured", source };
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
