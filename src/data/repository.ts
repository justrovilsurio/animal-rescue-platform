import type { AppState } from '../domain/types';
import { seedState } from './seed';
import { migrate } from './migrate';

/**
 * The seam where Supabase plugs in later. Screens never touch storage
 * directly; they go through the store, which goes through a Repository.
 * Swapping LocalStorageRepository for a SupabaseRepository is the whole
 * migration for the data layer.
 */
export interface Repository {
  load(): AppState;
  save(state: AppState): SaveResult;
  reset(): AppState;
}

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' };

export const STORAGE_KEY = 'kindred:v1';

export class LocalStorageRepository implements Repository {
  constructor(private storage: Storage | null = safeLocalStorage(), private key = STORAGE_KEY) {}

  load(): AppState {
    if (!this.storage) return seedState();
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return seedState();
      // Older versions are migrated forward; an unknown shape starts fresh rather than crash.
      return migrate(JSON.parse(raw)) ?? seedState();
    } catch {
      return seedState();
    }
  }

  save(state: AppState): SaveResult {
    if (!this.storage) return { ok: false, reason: 'unavailable' };
    try {
      this.storage.setItem(this.key, JSON.stringify(state));
      return { ok: true };
    } catch (err) {
      const quota = err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22);
      return { ok: false, reason: quota ? 'quota' : 'unavailable' };
    }
  }

  reset(): AppState {
    try { this.storage?.removeItem(this.key); } catch { /* ignore */ }
    return seedState();
  }
}

function safeLocalStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = '__kindred_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}
