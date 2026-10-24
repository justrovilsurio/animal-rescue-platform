import type { Collection, ContentByCollection, Entry, EntryStatus } from './types';
import { supportHref } from './sections';

/** Deep-ish equality for plain JSON content. Good enough for form data. */
export function sameContent(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function createEntry<T>(content: T, id: string, now: string): Entry<T> {
  return { id, createdAt: now, publishedAt: null, published: null, draft: content };
}

export function entryStatus(e: Entry<unknown>): EntryStatus {
  if (e.published === null) return 'draft';
  return e.draft === null ? 'live' : 'pending';
}

/** What a visitor sees. null means the entry is not on the public page. */
export function publicContent<T>(e: Entry<T>): T | null {
  return e.published;
}

/** What the group sees in Preview: their latest version. */
export function previewContent<T>(e: Entry<T>): T | null {
  return e.draft ?? e.published;
}

/** The version the editor works on. Every entry has at least one version. */
export function workingCopy<T>(e: Entry<T>): T {
  const c = e.draft ?? e.published;
  if (c === null) throw new Error(`Entry ${e.id} has no content`);
  return c;
}

/**
 * Apply a change to the working copy. If the result is identical to the
 * published version, the draft is dropped: there is nothing left to publish.
 */
export function editEntry<T>(e: Entry<T>, patch: Partial<T>): Entry<T> {
  const next = { ...workingCopy(e), ...patch };
  if (e.published !== null && sameContent(next, e.published)) return { ...e, draft: null };
  return { ...e, draft: next };
}

export function publishEntry<T>(e: Entry<T>, now: string): Entry<T> {
  if (e.draft === null) return e;
  return { ...e, published: e.draft, draft: null, publishedAt: now };
}

/** Drop unpublished edits. Only meaningful once something is live. */
export function discardDraft<T>(e: Entry<T>): Entry<T> {
  if (e.published === null || e.draft === null) return e;
  return { ...e, draft: null };
}

export function unpublishEntry<T>(e: Entry<T>): Entry<T> {
  if (e.published === null) return e;
  return { ...e, draft: e.draft ?? e.published, published: null, publishedAt: null };
}

export type FieldErrors = Partial<Record<string, string>>;

export function validateForPublish<C extends Collection>(collection: C, content: ContentByCollection[C]): FieldErrors {
  const errors: FieldErrors = {};
  if (collection === 'rescues' || collection === 'adopt') {
    const c = content as ContentByCollection['adopt'];
    if (!c.name.trim()) errors.name = 'Give them a name, even a temporary one.';
    if (c.photos.length === 0) errors.photos = 'Add a cover photo. It is what visitors see first.';
  } else if (collection === 'team') {
    const c = content as ContentByCollection['team'];
    if (!c.name.trim()) errors.name = 'Add their name. A first name is fine.';
  } else if (collection === 'support') {
    const c = content as ContentByCollection['support'];
    if (!c.title.trim()) errors.title = 'Add a title.';
    if (!c.url.trim()) errors.url = 'Add the link to your page so visitors can reach it.';
    else if (!supportHref(c.url)) errors.url = 'That doesn’t look like a web link. Paste the full address, like facebook.com/yourpage.';
  } else {
    const c = content as { title: string };
    if (!c.title.trim()) errors.title = 'Add a title.';
  }
  return errors;
}
