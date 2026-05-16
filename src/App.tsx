import { useMemo, useState } from "react";
import { scenarios } from "./data/scenarios";
import { ScenarioPage } from "./components/ScenarioPage";
import { SummaryDashboard } from "./components/SummaryDashboard";
import { StatusPill } from "./components/StatusPill";

export default function App() {
  const [selectedId, setSelectedId] = useState("summary");
  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedId),
    [selectedId],
  );

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">AF</span>
          <div>
            <strong>AppFlowy</strong>
            <span>Profiling Lab</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Dashboard navigation">
          <button className={selectedId === "summary" ? "active" : ""} onClick={() => setSelectedId("summary")}>
            <span>Dashboard</span>
            <small>Overview</small>
          </button>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={selectedId === scenario.id ? "active" : ""}
              onClick={() => setSelectedId(scenario.id)}
            >
              <span>{scenario.shortTitle}</span>
              <StatusPill status={scenario.status} />
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Embedded evidence</strong>
          <span>DevTools CSV/JSON exports and developer-mode screenshots live in the project. No upload flow is used.</span>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <span className="topbar__eyebrow">Android / Flutter profile mode</span>
            <strong>AppFlowy performance report</strong>
          </div>
          <div className="topbar__chips">
            <span>7 scenarios</span>
            <span>2 scenarios measured</span>
            <span>DevTools + developer mode</span>
          </div>
        </header>
        {selectedScenario ? <ScenarioPage scenario={selectedScenario} /> : <SummaryDashboard />}
      </div>
    </div>
  );
}
