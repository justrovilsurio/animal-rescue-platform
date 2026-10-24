import { describe, it, expect } from 'vitest';
import {
  createEntry, editEntry, publishEntry, discardDraft, unpublishEntry,
  entryStatus, publicContent, previewContent, workingCopy, validateForPublish,
} from './publishing';
import type { AdoptionContent, Entry, SupportContent } from './types';
import { supportCta, supportHref } from './sections';

const NOW = '2026-10-22T00:00:00.000Z';
const LATER = '2026-10-23T00:00:00.000Z';

const mango: AdoptionContent = {
  name: 'Mango', species: 'Dog', breed: 'Aspin', location: 'Pasig',
  photos: [{ id: 'p1', src: '/photos/mango-mix.webp' }],
  age: { mode: 'approx', text: 'About 2 years' }, sex: 'Male', personality: 'Calm', health: 'Vaccinated',
};

function liveMango(): Entry<AdoptionContent> {
  return publishEntry(createEntry(mango, 'mango', NOW), NOW);
}

describe('entry status is derived from its versions', () => {
  it('a new entry is a draft and invisible to visitors', () => {
    const e = createEntry(mango, 'mango', NOW);
    expect(entryStatus(e)).toBe('draft');
    expect(publicContent(e)).toBeNull();
    expect(previewContent(e)?.name).toBe('Mango');
  });

  it('publishing makes the draft the live version and clears the draft', () => {
    const e = liveMango();
    expect(entryStatus(e)).toBe('live');
    expect(e.draft).toBeNull();
    expect(publicContent(e)?.name).toBe('Mango');
    expect(e.publishedAt).toBe(NOW);
  });
});

describe('editing a published entry', () => {
  it('keeps the live version untouched until the update is published', () => {
    const edited = editEntry(liveMango(), { location: 'Marikina' });
    expect(entryStatus(edited)).toBe('pending');
    expect(publicContent(edited)?.location).toBe('Pasig');
    expect(workingCopy(edited).location).toBe('Marikina');

    const published = publishEntry(edited, LATER);
    expect(entryStatus(published)).toBe('live');
    expect(publicContent(published)?.location).toBe('Marikina');
    expect(published.publishedAt).toBe(LATER);
  });

  it('editing a field back to its published value clears the pending state', () => {
    const e = editEntry(editEntry(liveMango(), { location: 'Marikina' }), { location: 'Pasig' });
    expect(entryStatus(e)).toBe('live');
    expect(e.draft).toBeNull();
  });

  it('builds on the existing draft rather than restarting from the live version', () => {
    const e = editEntry(editEntry(liveMango(), { location: 'Marikina' }), { breed: 'Mixed' });
    expect(workingCopy(e)).toMatchObject({ location: 'Marikina', breed: 'Mixed' });
  });

  it('discarding edits restores the published version exactly', () => {
    const e = discardDraft(editEntry(liveMango(), { name: 'Mangoes' }));
    expect(entryStatus(e)).toBe('live');
    expect(workingCopy(e).name).toBe('Mango');
  });

  it('does not let you discard a never-published draft (that would delete it)', () => {
    const draft = createEntry(mango, 'mango', NOW);
    expect(discardDraft(draft)).toBe(draft);
  });

  it('never mutates the entry it was given', () => {
    const e = liveMango();
    const snapshot = JSON.stringify(e);
    editEntry(e, { name: 'X' });
    publishEntry(e, LATER);
    expect(JSON.stringify(e)).toBe(snapshot);
  });
});

describe('unpublishing', () => {
  it('takes the entry off the public page but keeps its content as a draft', () => {
    const e = unpublishEntry(editEntry(liveMango(), { name: 'Mango Jr' }));
    expect(entryStatus(e)).toBe('draft');
    expect(publicContent(e)).toBeNull();
    expect(workingCopy(e).name).toBe('Mango Jr');
  });
});

describe('validateForPublish', () => {
  it('requires a name and a cover photo for animals', () => {
    expect(validateForPublish('adopt', { ...mango, name: '  ', photos: [] })).toEqual({
      name: 'Give them a name, even a temporary one.',
      photos: 'Add a cover photo. It is what visitors see first.',
    });
    expect(validateForPublish('adopt', mango)).toEqual({});
  });

  it('requires a title for community entries', () => {
    expect(validateForPublish('guides', { title: '', body: 'x', readTime: '' })).toEqual({ title: 'Add a title.' });
    expect(validateForPublish('prepare', { title: ' ', body: 'x', icon: 'heart' })).toEqual({ title: 'Add a title.' });
  });

  it('requires only a name for team members; the photo is optional', () => {
    expect(validateForPublish('team', { name: '', role: 'Driver', bio: '', photo: null })).toEqual({ name: 'Add their name. A first name is fine.' });
    expect(validateForPublish('team', { name: 'Ana', role: '', bio: '', photo: null })).toEqual({});
  });

  it('requires a title and a real web link for "Ways to support us"; offer, button text and image are optional', () => {
    const fb: SupportContent = { platform: 'facebook', title: 'Become a monthly supporter', body: '', offer: '₱99 / month', url: 'facebook.com/secondwindrescue', cta: '', image: null };
    expect(validateForPublish('support', fb)).toEqual({});
    expect(validateForPublish('support', { ...fb, title: '', url: '' })).toEqual({ title: 'Add a title.', url: 'Add the link to your page so visitors can reach it.' });
    expect(Object.keys(validateForPublish('support', { ...fb, url: 'javascript:alert(1)' }))).toEqual(['url']);
    expect(Object.keys(validateForPublish('support', { ...fb, url: 'my page' }))).toEqual(['url']);
  });
});

describe('Ways to support us links and buttons', () => {
  it('adds https:// to bare links and refuses anything that is not a web page', () => {
    expect(supportHref('facebook.com/secondwindrescue')).toBe('https://facebook.com/secondwindrescue');
    expect(supportHref('  https://www.instagram.com/x  ')).toBe('https://www.instagram.com/x');
    expect(supportHref('mailto:a@b.co')).toBeNull();
    expect(supportHref('')).toBeNull();
  });

  it('defaults the button text to the platform, switching to "Subscribe" when there is an offer', () => {
    expect(supportCta({ platform: 'facebook', offer: '₱99 / month', cta: '' })).toBe('Subscribe on Facebook');
    expect(supportCta({ platform: 'instagram', offer: '', cta: '' })).toBe('Follow on Instagram');
    expect(supportCta({ platform: 'other', offer: '', cta: '' })).toBe('Visit');
    expect(supportCta({ platform: 'tiktok', offer: '', cta: ' Watch us ' })).toBe('Watch us');
  });
});
