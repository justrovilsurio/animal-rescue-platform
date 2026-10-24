import type { AppState, Entry, StoryContent } from '../domain/types';
import { PREPARE_STARTERS, SEED_VERSION } from './seed';

/**
 * Bring saved data forward to the current shape without losing a group's work.
 * Returns null when the data can't be read, so the caller falls back to the seed.
 *
 *   v1 → v2: adds "Before you adopt" (three starter points, as drafts) and
 *            "Meet our team" (empty); stories gain adopter and animal fields.
 *   v2 → v3: adds "Ways to support us" (empty, switched on; an empty section
 *            never shows to visitors).
 */
export function migrate(raw: unknown, now = new Date().toISOString()): AppState | null {
  const s = raw as { version?: number; page?: AppState['page']; entries?: Record<string, unknown> } | null;
  if (!s || !s.page || !s.entries) return null;
  if (s.version === SEED_VERSION) return s as AppState;
  if (s.version !== 1 && s.version !== 2) return null;
  const v2 = s.version === 1 ? fromV1(s as Saved, now) : (s as Saved);
  return fromV2(v2);
}

type Saved = { version: number; page: AppState['page']; entries: Record<string, unknown> };

function fromV1(s: Saved, now: string): Saved {
  type OldStory = Omit<StoryContent, 'adopter' | 'animal'> & Partial<StoryContent>;
  const upgrade = (c: OldStory | null): StoryContent | null => (c ? { ...c, adopter: c.adopter ?? '', animal: c.animal ?? '' } : null);
  const stories = (s.entries.stories as Entry<OldStory>[] | undefined ?? [])
    .map((e) => ({ ...e, published: upgrade(e.published), draft: upgrade(e.draft) }));

  return {
    ...s,
    version: 2,
    page: { ...s.page, visible: { ...s.page.visible, prepare: true, team: true } },
    entries: {
      ...s.entries,
      stories,
      prepare: PREPARE_STARTERS.slice(0, 3).map((content, i) => ({ id: `prep-${i + 1}`, createdAt: now, publishedAt: null, published: null, draft: content })),
      team: [],
    },
  };
}

function fromV2(s: Saved): AppState {
  return {
    ...(s as unknown as AppState),
    version: SEED_VERSION,
    page: { ...s.page, visible: { ...s.page.visible, support: true } },
    entries: { ...(s.entries as AppState['entries']), support: [] },
  };
}
