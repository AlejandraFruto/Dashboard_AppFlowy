export const ramConsumptionRows = [
  {
    scenario: "Scenario 1",
    name: "Application Startup",
    dartHeapMb: 47.3,
    allocatedMb: 47.19,
    rssMb: 264.51,
    maxFrameMs: 14.41,
    avgFrameMs: 13.33,
    finding: "Startup has the highest Dart heap, mostly from initialization, UI assets, icons, and SVG metadata.",
  },
  {
    scenario: "Scenario 2",
    name: "Workspace Navigation",
    dartHeapMb: 43.5,
    allocatedMb: 43.9,
    rssMb: 381.86,
    maxFrameMs: 61.29,
    avgFrameMs: 8.49,
    finding: "Dart heap stabilizes, but RSS rises sharply, suggesting native/graphics buffers are retained during navigation.",
  },
  {
    scenario: "Scenario 3",
    name: "Document Editing",
    dartHeapMb: 45.2,
    allocatedMb: 45.4,
    rssMb: 397.0,
    maxFrameMs: 36.52,
    avgFrameMs: 9.17,
    finding: "Editing adds moderate Dart heap pressure through editor state, result objects, text layout, and path rendering objects.",
  },
  {
    scenario: "Scenario 4",
    name: "Page Creation",
    dartHeapMb: 43.5,
    allocatedMb: 43.9,
    rssMb: 381.9,
    maxFrameMs: 35.37,
    avgFrameMs: 8.08,
    finding: "Page creation returns to the navigation baseline after the modal interaction, suggesting transient allocations are released.",
  },
];

export const leakRiskFindings = [
  {
    title: "No catastrophic leak in captures",
    severity: "Low",
    detail:
      "DevTools snapshots do not show unbounded Dart heap growth. The heap remains bounded between 43.5 MB and 47.3 MB across the four measured scenarios.",
  },
  {
    title: "Controller disposal is mostly safe",
    severity: "Low",
    detail:
      "TextEditingController and PopoverController patterns are described as explicitly released in dispose(), reducing the risk of retained listeners.",
  },
  {
    title: "Nested BlocBuilder retention risk",
    severity: "Medium",
    detail:
      "Nested stream consumers inside lazy viewport contexts may accumulate subscriptions if off-screen elements are cached instead of fully destroyed.",
  },
  {
    title: "High-frequency logging allocation churn",
    severity: "Medium",
    detail:
      "Rust logging creates transient Vec buffers per event. This is not a permanent leak, but it can increase allocator pressure and fragmentation under high logging volume.",
  },
];

export const memoryTopClasses = [
  { className: "CharacterMetrics", instances: 1138, sizeKb: 53.3, pattern: "Text measurement and font metrics; constant across scenarios." },
  { className: "TexSymbolConfig", instances: 1110, sizeKb: 34.7, pattern: "Text/symbol configuration; stable across scenarios." },
  { className: "Icon", instances: 977, sizeKb: 30.5, pattern: "UI icon instances used in workspace and editor views." },
  { className: "Success", instances: 1009, sizeKb: 31.5, pattern: "Editor/backend result objects visible in Scenario 3." },
  { className: "FlowySvg", instances: 214, sizeKb: 10.0, pattern: "SVG widgets and AppFlowy visual assets." },
  { className: "FieldInfo", instances: 90, sizeKb: 5.6, pattern: "Protobuf/reflection metadata; long-lived but bounded." },
  { className: "RenderConfig", instances: 172, sizeKb: 5.4, pattern: "Rendering configuration objects in scenarios 2-4." },
  { className: "_FieldSet", instances: 85, sizeKb: 4.0, pattern: "Structured protobuf-like metadata in scenarios 2-4." },
];

export const leakManagementTools = [
  {
    tool: "Flutter DevTools Memory Profiler",
    status: "Already used",
    use: "Heap snapshots, object allocation tracking, timeline visualization, and GC event observation.",
    limitation: "Reactive tool; it does not automatically prove or reject leaks without interpretation.",
  },
  {
    tool: "Leak Canary for Flutter",
    status: "Research candidate",
    use: "Automatic leak detection and retained object graph reporting.",
    limitation: "Community-maintained and may have compatibility limits with current Flutter versions.",
  },
  {
    tool: "Dart Observatory / VM profiling",
    status: "Advanced option",
    use: "Allocation timelines, VM events, GC analysis, and deeper runtime inspection.",
    limitation: "Requires additional profiling workflow beyond the current dashboard evidence.",
  },
  {
    tool: "Riverpod auto-dispose patterns",
    status: "Comparison point",
    use: "Illustrates automatic resource cleanup for state providers.",
    limitation: "AppFlowy uses Bloc, so this is mainly a reference for cleanup audits.",
  },
  {
    tool: "Android native memory profiler",
    status: "Recommended for Rust/JNI",
    use: "Native heap growth, C/Rust allocation hotspots, and JNI bridge memory tracking.",
    limitation: "Not part of the collected Flutter DevTools evidence set.",
  },
];

export const gcScenarioRows = [
  {
    scenario: "Startup",
    evidence: "47.3 MB heap, two frames below 16.67 ms, no visible GC pause spike.",
    conclusion: "Minimal GC pressure during startup; raster time is more relevant than GC.",
  },
  {
    scenario: "Navigation",
    evidence: "43.5 MB heap with worst frame at 61.29 ms and raster peak at 43.54 ms.",
    conclusion: "GC is unlikely to be the bottleneck; navigation jank is dominated by raster work.",
  },
  {
    scenario: "Editing",
    evidence: "45.2 MB heap, editor-specific objects, 293 frames over 120 Hz budget.",
    conclusion: "GC appears to keep heap bounded, but editing increases allocation and microtask pressure.",
  },
  {
    scenario: "Page Creation",
    evidence: "43.5 MB heap after modal interaction; memory returns to baseline.",
    conclusion: "Short-lived modal allocations appear to be reclaimed within a short period.",
  },
];

export const allocationPatterns = [
  {
    pattern: "Icon and SVG allocation",
    file: "frontend/appflowy_flutter/lib/generated/flowy_svgs.g.dart",
    evidence: "Icon, FlowySvg, and FlowySvgData counts are stable across scenarios.",
    impact: "No unbounded growth, but repeated views still create many small UI objects.",
  },
  {
    pattern: "Text rendering allocation",
    file: "frontend/appflowy_flutter/lib/workspace/presentation/widgets/view_title_bar.dart",
    evidence: "CharacterMetrics and TexSymbolConfig remain stable from startup through editing.",
    impact: "Text rendering is predictable and does not show significant growth.",
  },
  {
    pattern: "Editor object spike",
    file: "Editor modules inferred from Scenario 3 memory classes",
    evidence: "Success, Point, CubicToCommand, and _PathOffset appear during editing.",
    impact: "Editing creates scenario-specific objects, but the heap remains bounded.",
  },
  {
    pattern: "Protobuf metadata",
    file: "frontend/appflowy_flutter/lib/plugins/document/**",
    evidence: "FieldInfo, RenderConfig, SymbolRenderConfig, ErrorCode, and _FieldSet stay bounded.",
    impact: "Deserialization metadata appears cached rather than repeatedly growing.",
  },
];

export const threadingFindings = [
  {
    topic: "Flutter UI isolate",
    detail:
      "Created by the Flutter engine at startup. Most Dart UI code runs here, so blocking work can delay frame production.",
  },
  {
    topic: "Raster thread",
    detail:
      "Engine-managed thread responsible for rasterizing frames. Scenario 2 shows the strongest raster bottleneck, with 43.54 ms raster time in the worst frame.",
  },
  {
    topic: "Microtask queue",
    detail:
      "Dart async work is handled through the microtask/event queue. Scenario 3 reaches 24.81% CPU in _startMicrotaskLoop, indicating heavy editing-related async activity.",
  },
  {
    topic: "Platform channel handlers",
    detail:
      "Platform communication can isolate native work from the main UI thread, but slow handlers still add latency before results return to Dart.",
  },
  {
    topic: "Rust backend runtime",
    detail:
      "The report identifies Tokio-style async runtime behavior for backend work, with results returning to Dart through platform/event queues.",
  },
];

export const threadingSummaryRows = [
  { scenario: "Startup", dominant: "Raster", bottleneck: "Raster 9.84 ms", impact: "Moderate DevTools overhead" },
  { scenario: "Navigation", dominant: "Raster", bottleneck: "Raster 43.54 ms worst frame", impact: "High frame spike" },
  { scenario: "Editing", dominant: "Microtask/UI", bottleneck: "_startMicrotaskLoop 24.81% CPU", impact: "Affects responsiveness" },
  { scenario: "Page Creation", dominant: "Raster/Microtask", bottleneck: "Raster 16.16 ms p99", impact: "Transient modal cost" },
];

export const threadingRecommendations = [
  {
    title: "Raster thread optimization",
    detail: "Use RepaintBoundary, reduce expensive paint operations, and profile paint bottlenecks with DevTools Performance.",
  },
  {
    title: "Microtask queue management",
    detail: "Batch async operations, spread non-critical work across frames, and avoid unmanaged fire-and-forget futures.",
  },
  {
    title: "Main thread responsiveness",
    detail: "Keep blocking work off the UI isolate and use compute() selectively for expensive calculations.",
  },
  {
    title: "Rust backend thread pool",
    detail: "Tokio is auto-tuned, but database calls should avoid N+1 query patterns and long backend response chains.",
  },
];

export const existingMicroOptimizations = [
  {
    title: "Const widgets and const constructors",
    file: "frontend/appflowy_flutter/lib/workspace/presentation/widgets/view_title_bar.dart",
    benefit: "Reduces widget allocation and rebuild cost by allowing canonical reuse.",
  },
  {
    title: "Selective Bloc rebuild controls",
    file: "frontend/appflowy_flutter/lib/workspace/presentation/widgets/view_title_bar.dart",
    benefit: "buildWhen/listenWhen avoid unnecessary subtree rebuilds on irrelevant state changes.",
  },
  {
    title: "ValueKey identity preservation",
    file: "frontend/appflowy_flutter/lib/workspace/presentation/widgets/view_title_bar.dart",
    benefit: "Preserves child state and reduces teardown/rebuild work when breadcrumb order changes.",
  },
  {
    title: "Controller dispose lifecycle",
    file: "frontend/appflowy_flutter/lib/workspace/presentation/widgets/view_title_bar.dart",
    benefit: "Prevents retained listeners and ghost callbacks after widgets are removed.",
  },
  {
    title: "Rust iterator chains",
    file: "frontend/rust-lib/flowy-ai-pub/src/persistence/chat_sql.rs",
    benefit: "Improves data transformation paths and can reduce reallocation through size hints.",
  },
  {
    title: "Buffer-based logging serialization",
    file: "frontend/rust-lib/lib-log/src/layer.rs",
    benefit: "Writes JSON directly into a byte buffer, reducing intermediate string allocations.",
  },
];

export const optimizationProposals = [
  {
    title: "Memoize breadcrumb subtrees",
    target: "ViewTitleBar breadcrumb builder",
    benefit: "Avoids regenerating FlowyTooltip, ViewTitle, and FlowySvg widgets on unrelated rebuilds.",
  },
  {
    title: "Aggressive const usage",
    target: "Static UI widgets",
    benefit: "Canonicalizes static widgets and reduces runtime allocations during build.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8734",
  },
  {
    title: "Iterator-based UUID serialization",
    target: "chat_sql.rs",
    benefit: "Avoids intermediate Vec<String> materialization before JSON serialization.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8728",
  },
  {
    title: "Thread-local buffer reuse for logging",
    target: "lib-log/src/layer.rs",
    benefit: "Reuses Vec<u8> capacity per thread and reduces allocator pressure during logging.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8730",
  },
  {
    title: "Hoist anonymous builders",
    target: "Popup builder closures",
    benefit: "Moves repeated inline closures into reusable method references to reduce function-object churn.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8735",
  },
  {
    title: "Use ListView.separated for long breadcrumbs",
    target: "SingleChildScrollView + Row breadcrumb layout",
    benefit: "Lazily materializes visible breadcrumb items instead of laying out every segment.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8732",
  },
  {
    title: "Eliminate nested format! calls",
    target: "Rust logging formatting",
    benefit: "Writes directly into a mutable buffer and avoids temporary String fragmentation.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8729",
  },
  {
    title: "Cache parsed SVG drawables",
    target: "packages/flowy_svg/lib/src/flowy_svg.dart",
    benefit: "Avoids repeated XML/SVG parsing during widget builds with many icons.",
    pullRequest: "https://github.com/AppFlowy-IO/AppFlowy/pull/8731",
  },
];
