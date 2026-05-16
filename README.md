# AppFlowy Android Profiling Dashboard

Local React + Vite + TypeScript dashboard for presenting AppFlowy Android profiling scenarios.

## Run

```bash
npm install
npm run dev
```

## Data structure

Scenario data lives in `src/data/scenarios.ts`. Each scenario keeps the extracted numeric metrics, source file names, interpretation text, findings, and the English report-ready narrative block.

When new profiling files arrive, add the parsed values to the corresponding scenario entry. Missing metrics should remain `Not measured` or `Not available`; do not invent values.
