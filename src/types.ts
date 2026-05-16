export type MetricStatus = "measured" | "estimated" | "not-measured" | "not-available";

export interface NumericMetric {
  value: number | null;
  unit: string;
  status: MetricStatus;
  source?: string;
}

export interface MemoryMetrics {
  totalPssKb: NumericMetric;
  totalRssKb: NumericMetric;
  totalSwapPssKb: NumericMetric;
  nativeHeapPssKb: NumericMetric;
  nativeHeapRssKb: NumericMetric;
  nativeHeapSizeKb: NumericMetric;
  nativeHeapAllocKb: NumericMetric;
  nativeHeapFreeKb: NumericMetric;
  javaHeapPssKb: NumericMetric;
  javaHeapRssKb: NumericMetric;
  graphicsPssKb: NumericMetric;
  graphicsRssKb: NumericMetric;
  codePssKb: NumericMetric;
  stackPssKb: NumericMetric;
  privateOtherPssKb: NumericMetric;
  systemPssKb: NumericMetric;
  unknownRssKb: NumericMetric;
}

export interface ObjectMetrics {
  views: NumericMetric;
  viewRootImpl: NumericMetric;
  appContexts: NumericMetric;
  activities: NumericMetric;
  assets: NumericMetric;
  assetManagers: NumericMetric;
  webViews: NumericMetric;
  localBinders: NumericMetric;
  proxyBinders: NumericMetric;
  parcelMemory: NumericMetric;
  parcelCount: NumericMetric;
}

export interface CpuSample {
  sample: string;
  cpuPercent: number;
  residentMemoryMb: number;
  sharedMemoryMb: number;
  processState: string;
}

export interface CpuMetrics {
  processCount: NumericMetric;
  runningProcesses: NumericMetric;
  sleepingProcesses: NumericMetric;
  stoppedProcesses: NumericMetric;
  zombieProcesses: NumericMetric;
  appCpuAveragePercent: NumericMetric;
  appCpuMaxPercent: NumericMetric;
  appMemoryPercent: NumericMetric;
  samples: CpuSample[];
}

export interface ThreadMetrics {
  total: NumericMetric;
  peakTotal: NumericMetric;
  running: NumericMetric;
  sleeping: NumericMetric;
  stopped: NumericMetric;
  zombie: NumericMetric;
  notableGroups: string[];
  notableThreads: string[];
}

export interface GpuMetrics {
  totalFrames: NumericMetric;
  jankyFrames: NumericMetric;
  jankyPercent: NumericMetric;
  p50Ms: NumericMetric;
  p90Ms: NumericMetric;
  p95Ms: NumericMetric;
  p99Ms: NumericMetric;
  missedVsync: NumericMetric;
  highInputLatency: NumericMetric;
  slowUiThread: NumericMetric;
  slowBitmapUploads: NumericMetric;
  slowIssueDrawCommands: NumericMetric;
  frameDeadlineMissed: NumericMetric;
  gpuP50Ms: NumericMetric;
  gpuP90Ms: NumericMetric;
  gpuP95Ms: NumericMetric;
  gpuP99Ms: NumericMetric;
  importedGrallocKb: NumericMetric;
  pipeline: string;
  contexts: NumericMetric;
}

export interface OverdrawMetrics {
  status: MetricStatus;
  summary: string;
  evidence: string[];
}

export interface PowerMetrics {
  estimatedBatteryCapacityMah: NumericMetric;
  typicalBatteryCapacityMah: NumericMetric;
  totalRunTime: string;
  dischargeMah: NumericMetric;
  computedDrainMah: NumericMetric;
  actualDrainMah: NumericMetric;
  appEstimatedMah: NumericMetric;
  appCpuMah: NumericMetric;
  appWifiMah: NumericMetric;
  appForegroundMah: NumericMetric;
  appBackgroundMah: NumericMetric;
  appForegroundTime: string;
  screenOnTime: string;
  canTrustPowerProfile: boolean;
}

export interface DevToolsFrame {
  frame: number;
  uiMs: number;
  rasterMs: number;
  totalMs: number;
  vsyncOverheadMs: number;
}

export interface DevToolsMemoryClass {
  className: string;
  instances: number;
  totalSizeKb: number;
  dartHeapKb: number;
}

export interface DevToolsCpuHotspot {
  name: string;
  samples: number;
  percent: number;
}

export interface DevToolsMetrics {
  available: boolean;
  devToolsVersion: string;
  flutterVersion: string;
  buildMode: "debug" | "profile" | "release" | "unknown";
  displayRefreshRateHz: number | null;
  performanceRecordingFrames: number | null;
  rasterJankDetected: boolean | null;
  cpuSampleCount: number | null;
  cpuDurationMs: number | null;
  cpuSamplePeriodUs: number | null;
  cpuStackDepth: number | null;
  dartHeapMb: number | null;
  rssMb: number | null;
  allocatedMb: number | null;
  dartFlutterMb: number | null;
  dartFlutterNativeKb: number | null;
  rasterLayerBytes: number | null;
  rasterPictureBytes: number | null;
  averageFrameMs?: number | null;
  p95FrameMs?: number | null;
  p99FrameMs?: number | null;
  maxFrameMs?: number | null;
  averageUiMs?: number | null;
  averageRasterMs?: number | null;
  p95RasterMs?: number | null;
  maxRasterMs?: number | null;
  framesOver120HzBudget?: number | null;
  framesOver60HzBudget?: number | null;
  rasterOver120HzBudget?: number | null;
  developerFpsAverage?: number | null;
  developerCpuPercent?: number | null;
  developerGpuPercent?: number | null;
  frames: DevToolsFrame[];
  memoryClasses: DevToolsMemoryClass[];
  cpuHotspots: DevToolsCpuHotspot[];
}

export interface EvidenceAsset {
  title: string;
  kind: "performance" | "memory" | "cpu" | "inspector" | "overdraw" | "gpu" | "other";
  src?: string;
  caption: string;
}

export interface Findings {
  strengths: string[];
  weaknesses: string[];
  limitations: string[];
}

export interface ScenarioProfile {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  status: "complete" | "pending";
  description: string;
  sequence: string[];
  tools: string[];
  sourceFiles: string[];
  measurementContext: string;
  metrics: {
    memory: MemoryMetrics;
    objects: ObjectMetrics;
    cpu: CpuMetrics;
    threads: ThreadMetrics;
    gpu: GpuMetrics;
    overdraw: OverdrawMetrics;
    power: PowerMetrics;
    devTools: DevToolsMetrics;
  };
  evidence: EvidenceAsset[];
  interpretation: {
    memory: string;
    cpu: string;
    threads: string;
    gpu: string;
    overdraw: string;
    conclusion: string;
  };
  findings: Findings;
}
