import type { Collection } from './types';

/** The one public order. Groups can hide sections but never reorder them. */
export const SECTION_ORDER: { key: Collection; label: string; short: string; desc: string }[] = [
  { key: 'rescues', label: 'Rescue Gallery', short: 'Rescues', desc: 'Rescue stories and the animals behind them.' },
  { key: 'adopt', label: 'For Adoption', short: 'Adopt', desc: 'Animals ready for a home.' },
  { key: 'stories', label: 'Success stories', short: 'Stories', desc: 'Animals who found their homes.' },
  { key: 'events', label: 'Events', short: 'Events', desc: 'Adoption days, drives, meet-ups.' },
  { key: 'volunteer', label: 'Volunteer', short: 'Volunteer', desc: 'Ways people can give their time.' },
  { key: 'donation', label: 'Donation campaigns', short: 'Donate', desc: 'Campaigns with a QR code.' },
  { key: 'guides', label: 'Care guides', short: 'Care guides', desc: 'Practical guides for adopters.' },
];

export const sectionLabel = (key: Collection) => SECTION_ORDER.find((s) => s.key === key)!.label;
export const COMMUNITY_KEYS = SECTION_ORDER.slice(2).map((s) => s.key) as Exclude<Collection, 'rescues' | 'adopt'>[];
