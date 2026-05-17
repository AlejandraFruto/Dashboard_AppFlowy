import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
import {
  allocationPatterns,
  existingMicroOptimizations,
  gcScenarioRows,
  leakManagementTools,
  leakRiskFindings,
  memoryTopClasses,
  optimizationProposals,
  ramConsumptionRows,
  threadingFindings,
  threadingRecommendations,
  threadingSummaryRows,
} from "../data/deepAnalysis";

const sectionColors = ["#2d6f55", "#c18432", "#17633d", "#8f6f3f", "#a64231", "#6a4f34", "#d6b168", "#2f7f68"];

const memoryRadarData = [
  { axis: "Stable heap", value: 88 },
  { axis: "Leak risk", value: 34 },
  { axis: "Native/RSS pressure", value: 72 },
  { axis: "GC pressure", value: 46 },
  { axis: "Async pressure", value: 68 },
];

export function MemoryManagementDashboard() {
  return (
    <main className="page-shell">
      <DeepHero
        eyebrow="Report section 14.3.1 - 14.3.3"
        title="Memory management and leak risk"
        body="This page separates the report's memory-leak assessment, RAM consumption analysis, dominant memory classes, and leak-management tools from the scenario pages."
        stat="14.3"
        label="Memory section"
      />

      <section className="section-grid section-grid--wide-left">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">14.3.1</p>
              <h2>Memory leak assessment</h2>
            </div>
            <span className="pipeline-pill">No severe leak observed</span>
          </div>
          <p className="interpretation">
            Across the four profiled scenarios, the Dart heap remains bounded between 43.5 MB and 47.3 MB. The captures
            do not show catastrophic or unbounded heap growth, but the report identifies several areas that should be
            monitored in longer profiling sessions.
          </p>
          <div className="risk-grid">
            {leakRiskFindings.map((item) => (
              <article key={item.title} className="risk-card">
                <span className={`risk-pill risk-pill--${item.severity.toLowerCase()}`}>{item.severity}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Risk profile</p>
              <h2>Memory pressure radar</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={memoryRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar dataKey="value" stroke="#17633d" fill="#17633d" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">14.3.2</p>
              <h2>RAM consumption across scenarios</h2>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={310}>
              <BarChart data={ramConsumptionRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="scenario" />
                <YAxis unit=" MB" />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} MB`, ""]} />
                <Legend />
                <Bar dataKey="dartHeapMb" name="Dart heap" fill="#17633d" radius={[5, 5, 0, 0]} />
                <Bar dataKey="allocatedMb" name="Allocated" fill="#c18432" radius={[5, 5, 0, 0]} />
                <Bar dataKey="rssMb" name="RSS" fill="#2d6f55" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">
            Dart heap stays stable while RSS rises strongly after startup, suggesting native, graphics, or retained
            buffer pressure outside Dart-managed memory.
          </p>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Top classes</p>
              <h2>Dominant Dart object groups</h2>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={310}>
              <PieChart>
                <Pie data={memoryTopClasses} dataKey="sizeKb" nameKey="className" innerRadius={62} outerRadius={106} paddingAngle={2}>
                  {memoryTopClasses.map((entry, index) => (
                    <Cell key={entry.className} fill={sectionColors[index % sectionColors.length]} />
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
            <p className="eyebrow">Memory interpretation</p>
            <h2>Scenario-level RAM findings</h2>
          </div>
        </div>
        <div className="analysis-card-grid analysis-card-grid--four">
          {ramConsumptionRows.map((row) => (
            <article key={row.scenario} className="analysis-card">
              <span>{row.scenario}</span>
              <h3>{row.name}</h3>
              <strong>{row.dartHeapMb.toFixed(1)} MB Dart heap</strong>
              <p>{row.finding}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">14.3.3</p>
            <h2>Leak management tools</h2>
          </div>
        </div>
        <ToolTable />
      </section>
    </main>
  );
}

export function GarbageCollectionDashboard() {
  return (
    <main className="page-shell">
      <DeepHero
        eyebrow="Report section 14.3.4"
        title="Garbage collection and allocation patterns"
        body="This page focuses only on GC behavior, heap stability, temporary allocations, and the object patterns that explain memory pressure across the four scenarios."
        stat="GC"
        label="Heap behavior"
      />

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GC by scenario</p>
              <h2>Behavior inferred from DevTools evidence</h2>
            </div>
          </div>
          <div className="detail-list">
            {gcScenarioRows.map((row) => (
              <p key={row.scenario}>
                <strong>{row.scenario}:</strong> {row.evidence} {row.conclusion}
              </p>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Frame and heap context</p>
              <h2>Max frame vs Dart heap</h2>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ramConsumptionRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="scenario" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dartHeapMb" name="Dart heap MB" fill="#17633d" radius={[5, 5, 0, 0]} />
                <Bar dataKey="maxFrameMs" name="Max frame ms" fill="#a64231" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Deep allocation patterns</p>
            <h2>Where memory pressure comes from</h2>
          </div>
        </div>
        <div className="analysis-card-grid">
          {allocationPatterns.map((item) => (
            <article key={item.pattern} className="analysis-card">
              <span>{item.pattern}</span>
              <h3>{item.file}</h3>
              <p>{item.evidence}</p>
              <strong>{item.impact}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ThreadingDashboard() {
  return (
    <main className="page-shell">
      <DeepHero
        eyebrow="Report section 14.3.5"
        title="Threading, async work, and bottlenecks"
        body="This page separates the threading model from the memory content: UI isolate work, raster thread behavior, microtask pressure, platform channels, and backend async runtime."
        stat="14.3.5"
        label="Threading model"
      />

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Architecture</p>
              <h2>Threading architecture and async impact</h2>
            </div>
          </div>
          <div className="detail-list">
            {threadingFindings.map((item) => (
              <p key={item.topic}>
                <strong>{item.topic}:</strong> {item.detail}
              </p>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h2>Threading improvements</h2>
            </div>
          </div>
          <div className="analysis-card-grid">
            {threadingRecommendations.map((item) => (
              <article key={item.title} className="analysis-card">
                <span>Recommendation</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Threading summary</p>
            <h2>Dominant bottlenecks</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Dominant area</th>
                <th>Bottleneck</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {threadingSummaryRows.map((row) => (
                <tr key={row.scenario}>
                  <td>{row.scenario}</td>
                  <td>{row.dominant}</td>
                  <td>{row.bottleneck}</td>
                  <td>{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export function OptimizationDashboard() {
  return (
    <main className="page-shell">
      <DeepHero
        eyebrow="Report section 15"
        title="Micro-optimizations and proposed fixes"
        body="This page contains the optimization material from the imported report range. It is separated from the profiling evidence so implementation ideas do not blur the measured scenario results."
        stat="15"
        label="Optimization appendix"
      />

      <section className="section-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">15.1</p>
              <h2>Micro-optimizations found</h2>
            </div>
          </div>
          <div className="optimization-list">
            {existingMicroOptimizations.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <code>{item.file}</code>
                <p>{item.benefit}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">15.2</p>
              <h2>Optimization proposals and PR links</h2>
            </div>
          </div>
          <div className="optimization-list">
            {optimizationProposals.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <code>{item.target}</code>
                <p>{item.benefit}</p>
                {item.pullRequest ? (
                  <a href={item.pullRequest} target="_blank" rel="noreferrer">
                    Pull request
                  </a>
                ) : (
                  <span className="proposal-note">Proposal described in report</span>
                )}
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function DeepHero({ eyebrow, title, body, stat, label }: { eyebrow: string; title: string; body: string; stat: string; label: string }) {
  return (
    <section className="hero-panel hero-panel--dashboard">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
      <div className="hero-scorecard">
        <span>{label}</span>
        <strong>{stat}</strong>
        <small>Imported from pages 102-153 of the final report PDF</small>
      </div>
    </section>
  );
}

function ToolTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Status</th>
            <th>Use</th>
            <th>Limitation</th>
          </tr>
        </thead>
        <tbody>
          {leakManagementTools.map((tool) => (
            <tr key={tool.tool}>
              <td>{tool.tool}</td>
              <td>{tool.status}</td>
              <td>{tool.use}</td>
              <td>{tool.limitation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
