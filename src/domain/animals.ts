import type { AdoptionContent, AdoptionFilters, AgeBand, AgeInput } from './types';

export const AGE_BANDS: { value: Exclude<AgeBand, 'unknown'>; label: string }[] = [
  { value: 'u6m', label: 'Under 6 months' },
  { value: '6-12m', label: '6–12 months' },
  { value: '1-3y', label: '1–3 years' },
  { value: '3-7y', label: '3–7 years' },
  { value: '7y+', label: '7 years and up' },
];
export const AGE_FILTER_OPTIONS: { value: AgeBand; label: string }[] = [...AGE_BANDS, { value: 'unknown', label: 'Age not known' }];

export const COMMON_SPECIES = ['Dog', 'Cat', 'Rabbit', 'Bird'];

function bandFromMonths(m: number): AgeBand {
  if (m < 6) return 'u6m';
  if (m < 12) return '6-12m';
  if (m < 36) return '1-3y';
  if (m < 84) return '3-7y';
  return '7y+';
}

/**
 * Turn whatever a volunteer typed ("about 2 yrs", "8 weeks", "senior") into a
 * band the age filter can use. Anything we can't read confidently is
 * 'unknown' rather than a guess, so it still shows under "Age not known".
 */
export function ageBandOf(age: AgeInput): AgeBand {
  if (age.mode === 'range') return age.band;
  if (age.mode === 'unknown') return 'unknown';
  const t = age.text.toLowerCase().trim();
  if (!t) return 'unknown';
  if (/\b(puppy|kitten|newborn)\b/.test(t)) return 'u6m';
  if (/\b(senior|elderly|old (dog|cat|boy|girl))\b/.test(t)) return '7y+';

  const unit = /(week|wk|month|mo|year|yr)/.exec(t)?.[1];
  const nums = (t.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  // "a year" / "about a year"
  if (nums.length === 0 && /\ba (year|yr)\b/.test(t)) nums.push(1);
  if (nums.length === 0 || !unit) return 'unknown';

  const n = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  const months = unit.startsWith('w') ? n / 4.345 : unit.startsWith('mo') ? n : n * 12;
  return bandFromMonths(months);
}

export function ageLabel(age: AgeInput): string | null {
  if (age.mode === 'approx') return age.text.trim() || null;
  if (age.mode === 'range') return AGE_BANDS.find((b) => b.value === age.band)?.label ?? null;
  return null;
}

const norm = (s: string) => s.trim().toLowerCase();
const titleCase = (s: string) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase());

export function filterAnimals<T extends AdoptionContent>(list: T[], f: AdoptionFilters): T[] {
  return list.filter((a) => {
    if (f.species !== 'all' && norm(a.species) !== norm(f.species)) return false;
    if (f.age !== 'any' && ageBandOf(a.age) !== f.age) return false;
    if (f.location !== 'any' && norm(a.location) !== norm(f.location)) return false;
    return true;
  });
}

export function filterOptions(list: AdoptionContent[]): { species: string[]; locations: string[] } {
  const uniq = (vals: string[]) => {
    const m = new Map<string, string>();
    vals.filter((v) => v.trim()).forEach((v) => { if (!m.has(norm(v))) m.set(norm(v), titleCase(v)); });
    return [...m.values()].sort((a, b) => a.localeCompare(b));
  };
  return { species: uniq(list.map((a) => a.species)), locations: uniq(list.map((a) => a.location)) };
}

export function factsLine(a: AdoptionContent): string {
  return [a.species.trim(), ageLabel(a.age)].filter(Boolean).join(' · ');
}

export const EMPTY_FILTERS: AdoptionFilters = { species: 'all', age: 'any', location: 'any' };
