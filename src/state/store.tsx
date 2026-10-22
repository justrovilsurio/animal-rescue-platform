import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { reducer, type Action } from '../domain/reducer';
import type { AppState, Collection } from '../domain/types';
import { previewContent, publicContent, entryStatus } from '../domain/publishing';
import { LocalStorageRepository, type Repository } from '../data/repository';
import { useToast } from '../ui/Toast';

interface StoreValue {
  state: AppState;
  dispatch: (a: Action) => void;
  repo: Repository;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children, repo }: { children: ReactNode; repo?: Repository }) {
  const repoRef = useRef<Repository>(repo ?? new LocalStorageRepository());
  const [state, dispatch] = useReducer(reducer, undefined, () => repoRef.current.load());
  const toast = useToast();
  const warned = useRef(false);

  const unsaved = useRef<AppState | null>(null);

  // Persist, debounced: the editors autosave on every keystroke.
  useEffect(() => {
    unsaved.current = state;
    const id = window.setTimeout(() => {
      unsaved.current = null;
      const res = repoRef.current.save(state);
      if (!res.ok && !warned.current) {
        warned.current = true;
        toast(res.reason === 'quota'
          ? "Couldn't save: this browser's storage is full. Remove a few photos and try again."
          : "Couldn't save in this browser (private mode?). Changes will be lost when you close the tab.", { tone: 'error', duration: 8000 });
      }
      if (res.ok) warned.current = false;
    }, 250);
    return () => window.clearTimeout(id);
  }, [state, toast]);

  // Leaving inside the debounce window (closing the tab, a reload, a phone killing
  // a backgrounded tab) must not lose the last change: write it out right away.
  useEffect(() => {
    const flush = () => {
      if (!unsaved.current) return;
      repoRef.current.save(unsaved.current);
      unsaved.current = null;
    };
    const onHidden = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, []);

  const value = useMemo(() => ({ state, dispatch, repo: repoRef.current }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}

/**
 * The content a viewer should see for a collection. Visitors get published
 * versions only; Preview shows the group's latest version, with its status.
 */
export function useVisibleEntries<C extends Collection>(collection: C, preview: boolean) {
  const { state } = useStore();
  return useMemo(() => {
    const list = state.entries[collection];
    return list
      .map((e) => ({ id: e.id, status: entryStatus(e), content: preview ? previewContent(e) : publicContent(e) }))
      .filter((x): x is { id: string; status: ReturnType<typeof entryStatus>; content: NonNullable<typeof x.content> } => x.content !== null);
  }, [state.entries, collection, preview]);
}
