# Graph Report - animal rescue platform  (2026-10-22)

## Corpus Check
- 41 files · ~688,333 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, (none) 1, .tsbuildinfo 1)

## Summary
- 311 nodes · 949 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7ddd5a41`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Dashboard.tsx
- StatusBadge
- PublicSite.tsx
- package.json
- animals.ts
- Kindred: working prototype
- compilerOptions
- Editor.tsx
- CLAUDE.md
- publishing.ts
- Icon

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 38 edges
2. `useStore()` - 23 edges
3. `Editor()` - 21 edges
4. `PageTab()` - 20 edges
5. `EntriesTab()` - 18 edges
6. `Button` - 16 edges
7. `compilerOptions` - 16 edges
8. `react` - 15 edges
9. `Dashboard()` - 15 edges
10. `ButtonLink()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `How it's built, and why` --references--> `Repository`  [INFERRED]
  README.md → src/data/repository.ts
- `App()` --calls--> `Dashboard()`  [EXTRACTED]
  src/App.tsx → src/dashboard/Dashboard.tsx
- `App()` --calls--> `PublicSite()`  [EXTRACTED]
  src/App.tsx → src/public/PublicSite.tsx
- `setup()` --calls--> `App()`  [EXTRACTED]
  src/app.test.tsx → src/App.tsx
- `Start()` --calls--> `useStore()`  [EXTRACTED]
  src/Start.tsx → src/state/store.tsx

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "Dashboard.tsx"
Cohesion: 0.12
Nodes (31): blankContent(), AccountTab(), count(), Dashboard(), EntriesTab(), add(), addSamples(), isEmail() (+23 more)

### Community 1 - "StatusBadge"
Cohesion: 0.29
Nodes (5): react-dom, react-router-dom, App(), Start(), StatusBadge()

### Community 2 - "PublicSite.tsx"
Cohesion: 0.10
Nodes (56): EditorRoute(), PublishBar(), AGE_FILTER_OPTIONS, EMPTY_FILTERS, AdoptionFilters, CommunityCollection, EntryStatus, GroupPage (+48 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (35): dependencies, react, react-dom, react-router-dom, devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react (+27 more)

### Community 4 - "animals.ts"
Cohesion: 0.17
Nodes (16): BAND_LABEL, MESSAGE, THEMES, AGE_BANDS, ageBandOf(), ageLabel(), bandFromMonths(), COMMON_SPECIES (+8 more)

### Community 5 - "Kindred: working prototype"
Cohesion: 0.29
Nodes (6): How it's built, and why, Kindred: working prototype, Known limits of this prototype, Run it, Tests, What works

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 7 - "Editor.tsx"
Cohesion: 0.16
Nodes (19): ANIMAL, Edit, PREPARE_ICONS, FieldErrors, AdoptionContent, AnimalBase, AnimalCollection, Collection (+11 more)

### Community 10 - "publishing.ts"
Cohesion: 0.09
Nodes (39): vitest, setup(), migrate(), LocalStorageRepository, Repository, SaveResult, STORAGE_KEY, draftOnly() (+31 more)

### Community 11 - "Icon"
Cohesion: 0.14
Nodes (25): react, AnimalFields(), CommunityFields(), edit(), TeamFields(), AgePicker(), SpeciesPicker(), Photo (+17 more)

## Knowledge Gaps
- **4 isolated node(s):** `@types/react`, `@types/react-dom`, `jsdom`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 91 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Icon` to `Dashboard.tsx`, `StatusBadge`, `PublicSite.tsx`, `package.json`, `animals.ts`, `Editor.tsx`, `publishing.ts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `@types/react`, `@types/react-dom`, `jsdom` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11746031746031746 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `StatusBadge` to `Dashboard.tsx`, `PublicSite.tsx`, `package.json`, `Editor.tsx`, `publishing.ts`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `PublicSite.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09519230769230769 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05547652916073969 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._