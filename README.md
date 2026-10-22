# Kindred: working prototype

A page builder for animal rescue groups. Each group gets one public page (Rescue Gallery, For Adoption, community sections) and a private dashboard to run it.

This is **Option 1**: a complete front end with no backend. Everything you change is saved in your browser's localStorage. The data layer is built so Supabase can replace it later without touching the screens.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # watch mode
npm run test:run   # once (56 tests)
npm run build      # typecheck + production build
```

Start at `/`. It has two doors: **Visitor view** (`/second-wind`) and **Group dashboard** (`/dashboard`). The page starts **private**, so publish it from the dashboard first.

## What works

- **Public page** at `/second-wind`: header, Rescue Gallery, For Adoption, then whichever community sections are switched on, always in the same order.
- **Gallery pages** at `/second-wind/rescues` and `/second-wind/adopt`. The adoption page filters by animal type, age and location.
- **Shareable animal links** like `/second-wind/adopt/mango`. Each opens the detail overlay. Back, Escape or the close button dismiss it, and Share copies the link (or opens the phone's share sheet).
- **Private until first publish.** Visitors see "This page isn't public yet" until then.
- **Per-item publishing.** New items start as drafts. Edits to a published item autosave as **Unpublished edits**, and the live page keeps the old version until you press **Publish update**. You can also Discard edits, Unpublish, or Delete a draft (with Undo).
- **Section visibility.** Each section can be switched on or off (with Undo) but never reordered.
- **Editors** for animals and every community type, with photo upload (resized in the browser before saving), a QR image upload, and validation shown when you publish.
- **Preview** at `/dashboard/preview`: the public page including drafts, with status badges.
- **Page settings**: name, intro, city, email, Facebook handle (opens Messenger), logo, banner, and four fixed colour themes.
- **Account → Reset demo data** puts the sample group back.

## How it's built, and why

```
src/
  domain/        Pure TypeScript. No React, no storage. Most of the tests live here.
    types.ts       Entry = { published, draft }. Status is derived, never stored.
    publishing.ts  create / edit / publish / discard / unpublish / validate
    animals.ts     free-text age → filter band, filters, filter options
    reducer.ts     every state change as an action
    sections.ts    the one fixed section order
  data/
    repository.ts  Repository interface + LocalStorageRepository   ← Supabase plugs in here
    seed.ts        demo content
  state/store.tsx  React context + useReducer, debounced persistence
  public/          visitor pages, detail overlay (a route, not modal state)
  dashboard/       page settings, lists, editors, publish bar
  ui/              Button, Field, PhotoInput, Toast, StatusBadge, Icon, EmptyState
  styles/          tokens.css (from the design system) + component CSS
```

**1. Status is derived, not stored.** An entry holds up to two versions: `published` (what visitors see) and `draft` (unpublished changes). "Draft", "Unpublished edits" and "Published" are calculated from those two, so the badge can never say one thing while visitors see another. Editing a field back to its published value clears the pending state automatically (tested).

**2. The domain layer has no React.** Publishing rules, age parsing and filters are plain functions, so they're quick to test first and can later run on a server for validation.

**3. The repository is the seam to the backend.** Screens call `dispatch(action)`; the store saves through a `Repository`. Going to Supabase means writing a `SupabaseRepository`, not rewriting screens.

**4. The overlay is a URL.** `/second-wind/adopt/mango` opens the dialog. Opened from a card, the page underneath stays put (React Router's "background location" pattern); opened from a shared link, the gallery renders underneath.

**5. Autosave instead of a "Save draft" button.** This is a change from the design. Every edit is saved into the draft as you type, so nobody loses work by navigating away. Publishing is the only step that changes what visitors see.

**6. Free-text ages still filter.** "about 2 yrs", "8 weeks" and "senior" are turned into age bands. When an age can't be read, the editor says so while you type.

## Tests

| File | What it covers |
|---|---|
| `domain/publishing.test.ts` | the draft/published model, including no-op edits, immutability and discard rules |
| `domain/animals.test.ts` | 14 free-text age cases, band edges, filters, filter options |
| `domain/reducer.test.ts` | actions, delete + Undo restore |
| `data/repository.test.ts` | round trip, corrupt data, full storage, private mode |
| `app.test.tsx` | full flows: privacy, drafts hidden from visitors, edit → publish update, validation, section hiding, filters, deep-link dialog and Escape |

## Known limits of this prototype

- No sign-in: the dashboard is open. Google and username/password sign-in come with the backend.
- Data lives in one browser. localStorage holds about 5 MB, so expect roughly 20–30 uploaded photos before it fills (you get a clear error if it does).
- Facebook link previews need a small server function for per-animal preview tags (planned with the backend).
- The bundled photos are stand-ins from public research datasets and aren't licensed for production. Replace them.
- Deploying needs SPA fallback routing (every path serves `index.html`); `vite preview` and most hosts do this.
