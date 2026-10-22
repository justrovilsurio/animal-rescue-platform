import { describe, it, expect } from 'vitest';
import { reducer } from './reducer';
import { seedState } from '../data/seed';
import { entryStatus } from './publishing';

const find = (s: ReturnType<typeof seedState>, id: string) => s.entries.adopt.find((e) => e.id === id)!;

describe('reducer', () => {
  it('first publish of the page sets publishedAt once and later publishes keep it', () => {
    const a = reducer(seedState(), { type: 'page/publish', now: 'T1' });
    const b = reducer(a, { type: 'page/publish', now: 'T2' });
    expect(b.page.publishedAt).toBe('T1');
  });

  it('section visibility changes only that section', () => {
    const s = reducer(seedState(), { type: 'section/set', key: 'events', visible: false });
    expect(s.page.visible.events).toBe(false);
    expect(s.page.visible.volunteer).toBe(true);
  });

  it('edit → publish flows through the publishing rules', () => {
    let s = reducer(seedState(), { type: 'entry/edit', collection: 'adopt', id: 'mango', patch: { location: 'Marikina' } });
    expect(entryStatus(find(s, 'mango'))).toBe('pending');
    s = reducer(s, { type: 'entry/publish', collection: 'adopt', id: 'mango', now: 'T' });
    expect(find(s, 'mango').published?.location).toBe('Marikina');
  });

  it('new entries go to the top of their list as drafts', () => {
    const s = reducer(seedState(), {
      type: 'entry/create', collection: 'guides', id: 'g-new', now: 'T',
      content: { title: 'Leash training', body: '', readTime: '' },
    });
    expect(s.entries.guides[0].id).toBe('g-new');
    expect(entryStatus(s.entries.guides[0])).toBe('draft');
  });

  it('returns the same state object for an unknown id (no needless re-render)', () => {
    const s0 = seedState();
    expect(reducer(s0, { type: 'entry/publish', collection: 'adopt', id: 'nope', now: 'T' })).toBe(s0);
  });

  it('delete removes the entry and restore puts it back where it was (Undo)', () => {
    const s0 = seedState();
    const idx = s0.entries.adopt.findIndex((e) => e.id === 'kiko');
    const entry = s0.entries.adopt[idx];
    const s1 = reducer(s0, { type: 'entry/delete', collection: 'adopt', id: 'kiko' });
    expect(s1.entries.adopt.some((e) => e.id === 'kiko')).toBe(false);
    const s2 = reducer(s1, { type: 'entry/restore', collection: 'adopt', entry, index: idx });
    expect(s2.entries.adopt.map((e) => e.id)).toEqual(s0.entries.adopt.map((e) => e.id));
  });
});
