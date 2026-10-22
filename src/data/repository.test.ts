import { describe, it, expect } from 'vitest';
import { LocalStorageRepository, STORAGE_KEY } from './repository';
import { seedState } from './seed';
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
    expect(new LocalStorageRepository(localStorage).load().version).toBe(1);
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
