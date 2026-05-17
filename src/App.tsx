import { useMemo, useState } from "react";
import { scenarios } from "./data/scenarios";
import { ScenarioPage } from "./components/ScenarioPage";
import { SummaryDashboard } from "./components/SummaryDashboard";
import {
  GarbageCollectionDashboard,
  MemoryManagementDashboard,
  OptimizationDashboard,
  ThreadingDashboard,
} from "./components/DeepAnalysisDashboard";

export default function App() {
  const [selectedId, setSelectedId] = useState("summary");
  const [realmOpen, setRealmOpen] = useState(false);
  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedId),
    [selectedId],
  );

  if (!realmOpen) {
    return <RealmGate onEnter={() => setRealmOpen(true)} />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-block">
          <div>
            <strong>AppFlowy</strong>
            <span>Profiling Lab</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="Realm report navigation">
          <button className={selectedId === "summary" ? "active" : ""} onClick={() => setSelectedId("summary")}>
            <span>Realm Map</span>
            <small>Overview</small>
          </button>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={selectedId === scenario.id ? "active" : ""}
              onClick={() => setSelectedId(scenario.id)}
            >
              <span>{scenario.shortTitle}</span>
              <small>Scenario {scenario.order}</small>
            </button>
          ))}
          <button className={selectedId === "memory-management" ? "active" : ""} onClick={() => setSelectedId("memory-management")}>
            <span>Memory Mgmt</span>
            <small>Leaks & RAM</small>
          </button>
          <button className={selectedId === "gc-allocations" ? "active" : ""} onClick={() => setSelectedId("gc-allocations")}>
            <span>GC & Allocations</span>
            <small>14.3.4</small>
          </button>
          <button className={selectedId === "threading-analysis" ? "active" : ""} onClick={() => setSelectedId("threading-analysis")}>
            <span>Threading</span>
            <small>14.3.5</small>
          </button>
          <button className={selectedId === "optimization-analysis" ? "active" : ""} onClick={() => setSelectedId("optimization-analysis")}>
            <span>Optimizations</span>
            <small>15.x</small>
          </button>
        </nav>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <span className="topbar__eyebrow">Realm of Data</span>
            <strong>AppFlowy restored report</strong>
          </div>
          <div className="topbar__chips">
            <span>4 scenarios</span>
            <span>DevTools + developer mode</span>
          </div>
        </header>
        {renderSelectedContent(selectedId, selectedScenario)}
      </div>
    </div>
  );
}

function renderSelectedContent(selectedId: string, selectedScenario: ReturnType<typeof scenarios.find>) {
  if (selectedId === "memory-management") {
    return <MemoryManagementDashboard />;
  }
  if (selectedId === "gc-allocations") {
    return <GarbageCollectionDashboard />;
  }
  if (selectedId === "threading-analysis") {
    return <ThreadingDashboard />;
  }
  if (selectedId === "optimization-analysis") {
    return <OptimizationDashboard />;
  }
  return selectedScenario ? <ScenarioPage scenario={selectedScenario} /> : <SummaryDashboard />;
}

function RealmGate({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="realm-gate">
      <div className="realm-gate__hud">App Report Parts 6/6</div>
      <section className="realm-journal" aria-labelledby="realm-title">
        <p className="realm-journal__eyebrow">Mission Complete</p>
        <h1 id="realm-title">The Realm of Data opens</h1>
        <p>
          The report pages have been restored. Beyond this gate, the fragments collected in the forest become charts,
          screenshots, metrics, and scenario analysis for AppFlowy.
        </p>
        <div className="realm-journal__steps">
          <span>Startup</span>
          <span>Navigation</span>
          <span>Editing</span>
          <span>Creation</span>
        </div>
        <button className="realm-button" type="button" onClick={onEnter}>
          Enter the Realm of Data
        </button>
      </section>
      <div className="realm-gate__hint">Press the button to open the restored technical report</div>
    </main>
  );
}
