import type { Collection, SupportPlatform } from './types';

/** The one public order. Groups can hide sections but never reorder them. */
export const SECTION_ORDER: { key: Collection; label: string; short: string; desc: string }[] = [
  { key: 'rescues', label: 'Rescue Gallery', short: 'Rescues', desc: 'Rescue stories and the animals behind them.' },
  { key: 'adopt', label: 'For Adoption', short: 'Adopt', desc: 'Animals ready for a home.' },
  { key: 'prepare', label: 'Before you adopt', short: 'Before adopting', desc: 'Responsibilities adopters should weigh first.' },
  { key: 'stories', label: 'Updates from adopters', short: 'Updates', desc: 'News and photos from animals in their new homes.' },
  { key: 'events', label: 'Events', short: 'Events', desc: 'Adoption days, drives, meet-ups.' },
  { key: 'team', label: 'Meet our team', short: 'Team', desc: 'The caretakers and volunteers behind the rescues.' },
  { key: 'volunteer', label: 'Volunteer', short: 'Volunteer', desc: 'Ways people can give their time.' },
  { key: 'donation', label: 'Donation campaigns', short: 'Donate', desc: 'Campaigns with a QR code.' },
  { key: 'guides', label: 'Care guides', short: 'Care guides', desc: 'Practical guides for adopters.' },
  { key: 'support', label: 'Ways to support us', short: 'Support', desc: 'Your social pages, subscriptions and other ways to back you.' },
];

export const SUPPORT_PLATFORMS: { id: SupportPlatform; label: string }[] = [
  { id: 'facebook', label: 'Facebook' }, { id: 'instagram', label: 'Instagram' }, { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' }, { id: 'x', label: 'X' }, { id: 'other', label: 'Other' },
];
export const platformLabel = (id: SupportPlatform) => SUPPORT_PLATFORMS.find((p) => p.id === id)?.label ?? 'Link';

/** Groups paste links with or without https://. Anything else (javascript:, mailto:) is not a page link. */
export function supportHref(url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
  return /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(withScheme) ? withScheme : null;
}

/** The button text: what the group typed, or a sensible default for the platform. */
export function supportCta(c: { platform: SupportPlatform; offer: string; cta: string }): string {
  if (c.cta.trim()) return c.cta.trim();
  if (c.platform === 'other') return c.offer.trim() ? 'Join' : 'Visit';
  return `${c.offer.trim() ? 'Subscribe on' : 'Follow on'} ${platformLabel(c.platform)}`;
}

export const sectionLabel = (key: Collection) => SECTION_ORDER.find((s) => s.key === key)!.label;
export const COMMUNITY_KEYS = SECTION_ORDER.slice(2).map((s) => s.key) as Exclude<Collection, 'rescues' | 'adopt'>[];
