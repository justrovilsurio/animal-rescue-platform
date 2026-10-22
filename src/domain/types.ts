/**
 * Domain types. Nothing in here knows about React, the DOM or storage.
 *
 * The key idea: an entry never has a single "status" field you can set.
 * It holds up to two versions of its content:
 *   - `published`: what visitors see (null = never published)
 *   - `draft`:     unsaved-to-public changes (null = nothing pending)
 * The status shown in the UI is DERIVED from those two (see publishing.ts),
 * so it can never drift out of sync with what visitors actually see.
 */

export type AgeBand = 'u6m' | '6-12m' | '1-3y' | '3-7y' | '7y+' | 'unknown';

export type AgeInput =
  | { mode: 'approx'; text: string }
  | { mode: 'range'; band: Exclude<AgeBand, 'unknown'> }
  | { mode: 'unknown' };

export interface Photo {
  id: string;
  /** A URL or a data: URL for photos uploaded in the browser. */
  src: string;
}

export type Sex = 'Female' | 'Male' | null;

interface AnimalBase {
  name: string;
  /** "Dog", "Cat", "Rabbit", "Bird", or free text typed after choosing Other. */
  species: string;
  breed: string;
  /** City or general area. Never a street address. */
  location: string;
  /** First photo is the cover. */
  photos: Photo[];
}

export interface RescueContent extends AnimalBase {
  rescuedOn: string;
  story: string;
}

export interface AdoptionContent extends AnimalBase {
  age: AgeInput;
  sex: Sex;
  personality: string;
  health: string;
}

export interface StoryContent { title: string; body: string; adoptedOn: string; photos: Photo[] }
export interface EventContent { title: string; body: string; date: string; time: string; where: string }
export interface VolunteerContent { title: string; body: string; commitment: string }
export interface DonationContent { title: string; body: string; goal: number; raised: number; account: string; qr: Photo | null }
export interface GuideContent { title: string; body: string; readTime: string }

export interface ContentByCollection {
  rescues: RescueContent;
  adopt: AdoptionContent;
  stories: StoryContent;
  events: EventContent;
  volunteer: VolunteerContent;
  donation: DonationContent;
  guides: GuideContent;
}

export type Collection = keyof ContentByCollection;
export type AnimalCollection = 'rescues' | 'adopt';
export type CommunityCollection = Exclude<Collection, AnimalCollection>;

export interface Entry<T> {
  id: string;
  createdAt: string;
  publishedAt: string | null;
  published: T | null;
  draft: T | null;
}

export type EntryStatus = 'draft' | 'pending' | 'live';

export type GroupTheme = 'moss' | 'harbor' | 'cocoa' | 'slate';

export interface GroupPage {
  slug: string;
  name: string;
  intro: string;
  city: string;
  email: string;
  facebook: string;
  theme: GroupTheme;
  logo: Photo | null;
  banner: Photo | null;
  /** Section visibility. Order is fixed by SECTION_ORDER, never stored. */
  visible: Record<Collection, boolean>;
  /** null = the page is private (never published). */
  publishedAt: string | null;
}

export interface AppState {
  version: number;
  page: GroupPage;
  entries: { [C in Collection]: Entry<ContentByCollection[C]>[] };
}

export interface AdoptionFilters {
  species: 'all' | string;
  age: 'any' | AgeBand;
  location: 'any' | string;
}
