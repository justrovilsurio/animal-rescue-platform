# Graph Report - animal rescue platform  (2026-10-24)

## Corpus Check
- 50 files · ~702,913 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, (none) 1, .tsbuildinfo 1)

## Summary
- 350 nodes · 1052 edges · 14 communities (10 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1eb1adba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dashboard.tsx
- PublicSite.tsx
- package.json
- store.tsx
- Field.tsx
- compilerOptions
- Editor.tsx
- CLAUDE.md
- seed.ts
- Icon.tsx
- dashboard.spec.ts
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 38 edges
2. `useStore()` - 23 edges
3. `Editor()` - 21 edges
4. `PageTab()` - 20 edges
5. `EntriesTab()` - 20 edges
6. `react` - 17 edges
7. `PublicSite()` - 16 edges
8. `CommunityCard()` - 16 edges
9. `Button` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `How it's built, and why` --references--> `Repository`  [INFERRED]
  README.md → src/data/repository.ts
- `StoreProvider()` --indirect_call--> `reducer()`  [INFERRED]
  src/state/store.tsx → src/domain/reducer.ts
- `App()` --calls--> `Dashboard()`  [EXTRACTED]
  src/App.tsx → src/dashboard/Dashboard.tsx
- `App()` --calls--> `PublicSite()`  [EXTRACTED]
  src/App.tsx → src/public/PublicSite.tsx
- `Start()` --calls--> `useStore()`  [EXTRACTED]
  src/Start.tsx → src/state/store.tsx

## Import Cycles
- None detected.

## Communities (14 total, 4 thin omitted)

### Community 0 - "Dashboard.tsx"
Cohesion: 0.10
Nodes (38): blankContent(), AccountTab(), count(), Dashboard(), EntriesTab(), add(), addSamples(), isEmail() (+30 more)

### Community 2 - "PublicSite.tsx"
Cohesion: 0.12
Nodes (44): AnimalDetail(), share(), AnimalDetailRoute(), MissingAnimal(), Overlay(), AdoptionFiltersBar(), AnimalCard(), CommunityCard() (+36 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (42): dependencies, react, react-dom, react-router-dom, devDependencies, jsdom, @playwright/test, @testing-library/jest-dom (+34 more)

### Community 4 - "store.tsx"
Cohesion: 0.20
Nodes (20): createEntry(), discardDraft(), editEntry(), entryStatus(), FieldErrors, previewContent(), publicContent(), publishEntry() (+12 more)

### Community 5 - "Field.tsx"
Cohesion: 0.18
Nodes (25): ANIMAL, AnimalFields(), CommunityFields(), Edit, edit(), PREPARE_ICONS, SupportFields(), TeamFields() (+17 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 7 - "Editor.tsx"
Cohesion: 0.08
Nodes (41): BAND_LABEL, MESSAGE, THEMES, AGE_BANDS, AGE_FILTER_OPTIONS, ageBandOf(), ageLabel(), bandFromMonths() (+33 more)

### Community 10 - "seed.ts"
Cohesion: 0.09
Nodes (25): How it's built, and why, Kindred: working prototype, Known limits of this prototype, Run it, Tests, What works, fromV1(), fromV2() (+17 more)

### Community 11 - "Icon.tsx"
Cohesion: 0.12
Nodes (19): react, react-router-dom, App(), setup(), LocalStorageRepository, Start(), StoreCtx, StoreProvider() (+11 more)

### Community 12 - "dashboard.spec.ts"
Cohesion: 0.32
Nodes (7): PHOTO, expectNoSideScroll(), GROUP, publishPage(), SLUG, waitForSave(), @playwright/test

## Knowledge Gaps
- **4 isolated node(s):** `@types/react`, `@types/react-dom`, `jsdom`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 105 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Icon.tsx` to `Dashboard.tsx`, `PublicSite.tsx`, `package.json`, `Field.tsx`, `Editor.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `@types/react`, `@types/react-dom`, `jsdom` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10359408033826638 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Icon.tsx` to `Dashboard.tsx`, `PublicSite.tsx`, `package.json`, `Field.tsx`, `Editor.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `PublicSite.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12119013062409288 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._