import type { Collection, ContentByCollection } from '../domain/types';

/** What a freshly added entry starts as. Also used to spot untouched drafts. */
export function blankContent<C extends Collection>(collection: C): ContentByCollection[C] {
  const blanks: { [K in Collection]: ContentByCollection[K] } = {
    rescues: { name: '', species: 'Dog', breed: '', location: '', photos: [], rescuedOn: '', story: '' },
    adopt: { name: '', species: 'Dog', breed: '', location: '', photos: [], age: { mode: 'approx', text: '' }, sex: null, personality: '', health: '' },
    stories: { title: '', body: '', adoptedOn: '', photos: [] },
    events: { title: '', body: '', date: '', time: '', where: '' },
    volunteer: { title: '', body: '', commitment: '' },
    donation: { title: '', body: '', goal: 0, raised: 0, account: '', qr: null },
    guides: { title: '', body: '', readTime: '' },
  };
  return blanks[collection];
}
