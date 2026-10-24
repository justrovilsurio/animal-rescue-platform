import { describe, it, expect } from 'vitest';
import { LocalStorageRepository, STORAGE_KEY } from './repository';
import { SEED_VERSION, seedState } from './seed';
import { reducer } from '../domain/reducer';

describe('LocalStorageRepository', () => {
  it('starts from the demo seed when nothing is stored', () => {
    expect(new LocalStorageRepository(localStorage).load().page.name).toBe('Second Wind Rescue');
  });

  it('round-trips saved state', () => {
    const repo = new LocalStorageRepository(localStorage);
    const changed = reducer(seedState(), { type: 'page/update', patch: { name: 'Paws of Pasig' } });
    expect(repo.save(changed)).toEqual({ ok: true });
    expect(repo.load().page.name).toBe('Paws of Pasig');
  });

  it('falls back to the seed when stored data is corrupt or from another version', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(new LocalStorageRepository(localStorage).load().page.slug).toBe('second-wind');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }));
    expect(new LocalStorageRepository(localStorage).load().version).toBe(SEED_VERSION);
  });

  it('migrates version 1 data forward without losing the group’s work', () => {
    // A v1 save: no "Before you adopt" or "Meet our team", and stories without adopter/animal.
    const v2 = reducer(seedState(), { type: 'page/update', patch: { name: 'Paws of Pasig' } });
    const { prepare: _p, team: _t, ...v1Entries } = v2.entries;
    const { prepare: _vp, team: _vt, ...v1Visible } = v2.page.visible;
    const v1Stories = v2.entries.stories.map((e) => ({ ...e, published: e.published && { title: e.published.title, body: e.published.body, adoptedOn: e.published.adoptedOn, photos: e.published.photos } }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...v2, version: 1, page: { ...v2.page, visible: v1Visible }, entries: { ...v1Entries, stories: v1Stories } }));

    const loaded = new LocalStorageRepository(localStorage).load();
    expect(loaded.version).toBe(SEED_VERSION);
    expect(loaded.page.name).toBe('Paws of Pasig');
    expect(loaded.entries.adopt).toHaveLength(v2.entries.adopt.length);
    expect(loaded.entries.team).toEqual([]);
    expect(loaded.entries.prepare).toHaveLength(3);
    expect(loaded.entries.prepare.every((e) => e.published === null)).toBe(true); // starters arrive as drafts, invisible to visitors
    expect(loaded.page.visible.prepare && loaded.page.visible.team).toBe(true);
    expect(loaded.entries.stories[0].published).toMatchObject({ adopter: '', animal: '' });
    expect(loaded.entries.support).toEqual([]);
  });

  it('migrates version 2 data forward with an empty "Ways to support us"', () => {
    const v3 = reducer(seedState(), { type: 'page/update', patch: { name: 'Paws of Pasig' } });
    const { support: _s, ...v2Entries } = v3.entries;
    const { support: _vs, ...v2Visible } = v3.page.visible;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...v3, version: 2, page: { ...v3.page, visible: v2Visible }, entries: v2Entries }));

    const loaded = new LocalStorageRepository(localStorage).load();
    expect(loaded.version).toBe(SEED_VERSION);
    expect(loaded.page.name).toBe('Paws of Pasig');
    expect(loaded.entries.team).toEqual(v3.entries.team); // v2 work is untouched
    expect(loaded.entries.support).toEqual([]);
    expect(loaded.page.visible.support).toBe(true);
  });

  it('reports a full storage quota instead of throwing', () => {
    const full = {
      getItem: () => null, removeItem: () => {}, clear: () => {}, key: () => null, length: 0,
      setItem: () => { throw new DOMException('full', 'QuotaExceededError'); },
    } as Storage;
    expect(new LocalStorageRepository(full).save(seedState())).toEqual({ ok: false, reason: 'quota' });
  });

  it('works with no storage at all (private mode)', () => {
    const repo = new LocalStorageRepository(null);
    expect(repo.load().page.slug).toBe('second-wind');
    expect(repo.save(seedState())).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('reset clears saved data', () => {
    const repo = new LocalStorageRepository(localStorage);
    repo.save(reducer(seedState(), { type: 'page/publish', now: 'x' }));
    expect(repo.reset().page.publishedAt).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
