import { describe, it, expect } from 'vitest';
import { ageBandOf, ageLabel, filterAnimals, filterOptions, factsLine } from './animals';
import type { AdoptionContent, AgeInput } from './types';

const approx = (text: string): AgeInput => ({ mode: 'approx', text });

describe('ageBandOf: free-text ages still land in a filterable band', () => {
  it.each([
    ['About 3 months', 'u6m'],
    ['8 weeks', 'u6m'],
    ['10 mos', '6-12m'],
    ['about a year', '1-3y'],
    ['About 2 years', '1-3y'],
    ['2 yrs', '1-3y'],
    ['1.5 years', '1-3y'],
    ['4-5 years', '3-7y'],
    ['around 9 years old', '7y+'],
    ['senior', '7y+'],
    ['puppy', 'u6m'],
    ['kitten', 'u6m'],
    ['young adult?', 'unknown'],
    ['', 'unknown'],
  ])('"%s" → %s', (text, band) => {
    expect(ageBandOf(approx(text))).toBe(band);
  });

  it('uses the chosen band for ranges and unknown for "Not sure"', () => {
    expect(ageBandOf({ mode: 'range', band: '3-7y' })).toBe('3-7y');
    expect(ageBandOf({ mode: 'unknown' })).toBe('unknown');
  });

  it('treats exactly 12 months and exactly 7 years as the higher band', () => {
    expect(ageBandOf(approx('12 months'))).toBe('1-3y');
    expect(ageBandOf(approx('7 years'))).toBe('7y+');
  });
});

describe('ageLabel', () => {
  it('shows what the group typed, the band label, or nothing', () => {
    expect(ageLabel(approx('  About 2 years '))).toBe('About 2 years');
    expect(ageLabel({ mode: 'range', band: '6-12m' })).toBe('6–12 months');
    expect(ageLabel({ mode: 'unknown' })).toBeNull();
    expect(ageLabel(approx('   '))).toBeNull();
  });
});

function animal(over: Partial<AdoptionContent>): AdoptionContent {
  return {
    name: 'X', species: 'Dog', breed: '', location: 'Pasig', photos: [],
    age: { mode: 'unknown' }, sex: null, personality: '', health: '', ...over,
  };
}

describe('filterAnimals', () => {
  const list = [
    animal({ name: 'Mango', species: 'Dog', location: 'Pasig', age: approx('About 2 years') }),
    animal({ name: 'Saffron', species: 'Cat', location: 'Quezon City', age: approx('3 months') }),
    animal({ name: 'Atlas', species: 'Dog', location: 'Marikina', age: approx('9 years') }),
    animal({ name: 'Domino', species: 'Dog', location: 'Pasig', age: { mode: 'unknown' } }),
  ];
  const names = (f: Parameters<typeof filterAnimals>[1]) => filterAnimals(list, f).map((a) => a.name);

  it('returns everything with no filters', () => {
    expect(names({ species: 'all', age: 'any', location: 'any' })).toHaveLength(4);
  });
  it('combines species, age and location with AND', () => {
    expect(names({ species: 'Dog', age: 'any', location: 'Pasig' })).toEqual(['Mango', 'Domino']);
    expect(names({ species: 'Dog', age: '1-3y', location: 'Pasig' })).toEqual(['Mango']);
  });
  it('finds animals with no age under "unknown"', () => {
    expect(names({ species: 'all', age: 'unknown', location: 'any' })).toEqual(['Domino']);
  });
  it('matches species and location case-insensitively and ignores stray spaces', () => {
    const odd = [animal({ name: 'Pip', species: ' dog', location: 'pasig ' })];
    expect(filterAnimals(odd, { species: 'Dog', age: 'any', location: 'Pasig' })).toHaveLength(1);
  });
});

describe('filterOptions', () => {
  it('only offers species and places that exist, deduped and sorted', () => {
    const opts = filterOptions([
      animal({ species: 'Dog', location: 'Pasig' }), animal({ species: 'cat', location: 'Antipolo' }),
      animal({ species: 'Dog ', location: 'pasig' }), animal({ species: 'Dog', location: '' }),
    ]);
    expect(opts.species).toEqual(['Cat', 'Dog']);
    expect(opts.locations).toEqual(['Antipolo', 'Pasig']);
  });
});

describe('factsLine', () => {
  it('joins only the facts that are known', () => {
    expect(factsLine(animal({ species: 'Dog', age: approx('About 2 years') }))).toBe('Dog · About 2 years');
    expect(factsLine(animal({ species: 'Dog' }))).toBe('Dog');
  });
});
