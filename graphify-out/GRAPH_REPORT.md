# Graph Report - animal rescue platform  (2026-10-22)

## Corpus Check
- 40 files · ~686,325 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 2, (none) 1, .tsbuildinfo 1)

## Summary
- 299 nodes · 902 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Dashboard.tsx
- store.tsx
- PublicSite.tsx
- package.json
- animals.ts
- Icon.tsx
- compilerOptions
- PhotoInput.tsx
- CLAUDE.md
- Editor.tsx
- parts.tsx

## God Nodes (most connected - your core abstractions)
1. `Icon()` - 36 edges
2. `useStore()` - 23 edges
3. `Editor()` - 21 edges
4. `PageTab()` - 20 edges
5. `EntriesTab()` - 16 edges
6. `Button` - 16 edges
7. `compilerOptions` - 16 edges
8. `react` - 15 edges
9. `Dashboard()` - 15 edges
10. `ButtonLink()` - 15 edges

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

## Communities (12 total, 2 thin omitted)

### Community 0 - "Dashboard.tsx"
Cohesion: 0.15
Nodes (29): blankContent(), AccountTab(), count(), Dashboard(), EntriesTab(), add(), isEmail(), NAV (+21 more)

### Community 1 - "store.tsx"
Cohesion: 0.10
Nodes (22): How it's built, and why, Kindred: working prototype, Known limits of this prototype, Run it, Tests, What works, vitest, LocalStorageRepository (+14 more)

### Community 2 - "PublicSite.tsx"
Cohesion: 0.12
Nodes (48): CommunityCollection, AnimalDetail(), share(), AnimalDetailRoute(), MissingAnimal(), Overlay(), AdoptionFiltersBar(), AnimalCard() (+40 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (35): dependencies, react, react-dom, react-router-dom, devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react (+27 more)

### Community 4 - "animals.ts"
Cohesion: 0.21
Nodes (13): AGE_FILTER_OPTIONS, ageBandOf(), ageLabel(), bandFromMonths(), EMPTY_FILTERS, factsLine(), filterAnimals(), filterOptions() (+5 more)

### Community 5 - "Icon.tsx"
Cohesion: 0.12
Nodes (16): react, react-dom, react-router-dom, App(), setup(), Start(), StoreProvider(), IconName (+8 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 7 - "PhotoInput.tsx"
Cohesion: 0.33
Nodes (8): Photo, newId(), fileToPhoto(), loadImage(), MAX_UPLOAD_BYTES, PhotoInput(), onFiles(), Props

### Community 10 - "Editor.tsx"
Cohesion: 0.13
Nodes (32): ANIMAL, Edit, createEntry(), discardDraft(), editEntry(), FieldErrors, previewContent(), publicContent() (+24 more)

### Community 11 - "parts.tsx"
Cohesion: 0.18
Nodes (18): AnimalFields(), CommunityFields(), edit(), AgePicker(), BAND_LABEL, MESSAGE, SpeciesPicker(), THEMES (+10 more)

## Knowledge Gaps
- **4 isolated node(s):** `@types/react`, `@types/react-dom`, `jsdom`, `typescript`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 88 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Icon.tsx` to `Dashboard.tsx`, `store.tsx`, `PublicSite.tsx`, `package.json`, `PhotoInput.tsx`, `Editor.tsx`, `parts.tsx`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `@types/react`, `@types/react-dom`, `jsdom` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `store.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Icon.tsx` to `Dashboard.tsx`, `PublicSite.tsx`, `Editor.tsx`, `package.json`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `PublicSite.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11796733212341198 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05547652916073969 - nodes in this community are weakly interconnected._
- **Should `Icon.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._