import type { AppState, Collection, ContentByCollection, Entry, GroupPage } from './types';
import { createEntry, discardDraft, editEntry, publishEntry, unpublishEntry } from './publishing';

/**
 * Every change to the app goes through one of these actions. The reducer is
 * pure: same state + same action = same result, so it is trivial to test and
 * later to mirror on a server.
 */
export type Action =
  | { type: 'page/update'; patch: Partial<Omit<GroupPage, 'visible' | 'publishedAt' | 'slug'>> }
  | { type: 'page/publish'; now: string }
  | { type: 'page/unpublish' }
  | { type: 'section/set'; key: Collection; visible: boolean }
  | { type: 'entry/create'; collection: Collection; id: string; content: ContentByCollection[Collection]; now: string }
  | { type: 'entry/edit'; collection: Collection; id: string; patch: Partial<ContentByCollection[Collection]> }
  | { type: 'entry/publish'; collection: Collection; id: string; now: string }
  | { type: 'entry/discard'; collection: Collection; id: string }
  | { type: 'entry/unpublish'; collection: Collection; id: string }
  | { type: 'entry/delete'; collection: Collection; id: string }
  | { type: 'entry/restore'; collection: Collection; entry: Entry<ContentByCollection[Collection]>; index: number }
  | { type: 'state/replace'; state: AppState };

type AnyEntry = Entry<ContentByCollection[Collection]>;

function mapEntry(state: AppState, collection: Collection, id: string, fn: (e: AnyEntry) => AnyEntry): AppState {
  const list = state.entries[collection] as AnyEntry[];
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) return state;
  const nextEntry = fn(list[idx]);
  if (nextEntry === list[idx]) return state;
  const next = list.slice();
  next[idx] = nextEntry;
  return { ...state, entries: { ...state.entries, [collection]: next } };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'page/update':
      return { ...state, page: { ...state.page, ...action.patch } };
    case 'page/publish':
      return state.page.publishedAt ? state : { ...state, page: { ...state.page, publishedAt: action.now } };
    case 'page/unpublish':
      return { ...state, page: { ...state.page, publishedAt: null } };
    case 'section/set':
      return { ...state, page: { ...state.page, visible: { ...state.page.visible, [action.key]: action.visible } } };
    case 'entry/create': {
      const list = state.entries[action.collection] as AnyEntry[];
      return { ...state, entries: { ...state.entries, [action.collection]: [createEntry(action.content, action.id, action.now), ...list] } };
    }
    case 'entry/edit':
      return mapEntry(state, action.collection, action.id, (e) => editEntry(e, action.patch));
    case 'entry/publish':
      return mapEntry(state, action.collection, action.id, (e) => publishEntry(e, action.now));
    case 'entry/discard':
      return mapEntry(state, action.collection, action.id, discardDraft);
    case 'entry/unpublish':
      return mapEntry(state, action.collection, action.id, unpublishEntry);
    case 'entry/delete': {
      const list = state.entries[action.collection] as AnyEntry[];
      return { ...state, entries: { ...state.entries, [action.collection]: list.filter((e) => e.id !== action.id) } };
    }
    case 'entry/restore': {
      const list = (state.entries[action.collection] as AnyEntry[]).filter((e) => e.id !== action.entry.id);
      const i = Math.max(0, Math.min(action.index, list.length));
      return { ...state, entries: { ...state.entries, [action.collection]: [...list.slice(0, i), action.entry, ...list.slice(i)] } };
    }
    case 'state/replace':
      return action.state;
  }
}
