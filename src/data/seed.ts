import type { AdoptionContent, AppState, Entry, Photo, PrepareContent, SupportContent, TeamContent } from '../domain/types';

/**
 * Demo content so every screen renders at real density.
 * Photos are stand-ins from public research datasets: replace before launch.
 */
const T0 = '2026-10-01T09:00:00.000Z';
const p = (name: string): Photo => ({ id: name, src: `/photos/${name}.webp` });

function live<T>(id: string, content: T): Entry<T> {
  return { id, createdAt: T0, publishedAt: T0, published: content, draft: null };
}
function draftOnly<T>(id: string, content: T): Entry<T> {
  return { id, createdAt: T0, publishedAt: null, published: null, draft: content };
}
function pending<T>(id: string, content: T, edits: Partial<T>): Entry<T> {
  return { id, createdAt: T0, publishedAt: T0, published: content, draft: { ...content, ...edits } };
}

export const SEED_VERSION = 3;

/** Sample "Ways to support us" cards, for the demo and the "Add sample entries" button. */
export const SUPPORT_SAMPLES: SupportContent[] = [
  { platform: 'facebook', title: 'Become a monthly supporter', body: 'Subscribers get first look at new rescues, a supporter badge on their comments, and a monthly photo dump from our foster homes.',
    offer: '₱99 / month', url: 'facebook.com/secondwindrescue/subscribe', cta: '', image: p('saffron-kitten') },
  { platform: 'instagram', title: 'Daily foster life on Instagram', body: 'Morning zoomies, vet-day faces and the animals who just found homes.', offer: '', url: 'instagram.com/secondwindrescue', cta: '', image: p('kiko-shiba') },
  { platform: 'tiktok', title: 'Rescue stories in 60 seconds', body: 'Before-and-afters from the street to the sofa.', offer: '', url: 'tiktok.com/@secondwindrescue', cta: '', image: null },
];

/**
 * "Before you adopt" starter points. Groups that predate the section get the
 * first three as drafts (see migrate.ts), so they edit rather than start blank.
 */
/** Sample team members, for the demo and for the "Add sample entries" button on an empty team list. */
export const TEAM_SAMPLES: TeamContent[] = [
  { name: 'Ana', role: 'Founder and foster coordinator', bio: 'Matches every rescue with a foster home, usually by text at midnight.', photo: null },
  { name: 'Jomar', role: 'Rescue driver', bio: 'Has picked up dogs from flooded lots, highway shoulders and one jeepney roof.', photo: null },
  { name: 'Bea', role: 'Vet liaison', bio: 'Keeps the vaccine schedule and talks clinics into discounts.', photo: null },
];

export const PREPARE_STARTERS: PrepareContent[] = [
  { icon: 'heart', title: 'A lifetime commitment', body: 'Dogs and cats can live 10 to 15 years or more. Adopt only if you can care for them through moves, new jobs and new babies.' },
  { icon: 'clock', title: 'Time every day', body: 'Feeding, walks, play and training happen every single day, not just on weekends.' },
  { icon: 'vet', title: 'Vet care and its costs', body: 'Plan for food, yearly vaccines, deworming, spay or neuter, and the occasional emergency visit.' },
  { icon: 'home', title: 'A safe home', body: 'Secure gates and windows, shade and clean water. No chaining, and no roaming the street.' },
  { icon: 'paw', title: 'Patience while they settle', body: 'Rescued animals can be shy or anxious at first. Give them weeks, not days, to trust you.' },
  { icon: 'users', title: 'Everyone at home agrees', body: 'Talk it through with the whole household, including landlords, before you apply.' },
];

export function seedState(): AppState {
  return {
    version: SEED_VERSION,
    page: {
      slug: 'second-wind',
      name: 'Second Wind Rescue',
      intro: 'Six volunteers pulling dogs and cats off the streets of Quezon City, nursing them back, and finding them homes that stick. No shelter, no paid staff, just foster homes and a lot of kibble.',
      city: 'Quezon City, Metro Manila',
      email: 'hello@secondwind.ph',
      facebook: 'secondwindrescue',
      theme: 'moss',
      logo: null,
      banner: p('pippa-corgi'),
      visible: { rescues: true, adopt: true, prepare: true, stories: true, events: true, team: true, volunteer: true, donation: true, guides: true, support: true },
      publishedAt: null,
    },
    entries: {
      rescues: [
        live('biscuit', { name: 'Biscuit', species: 'Dog', breed: 'Beagle mix', location: 'Quezon City', photos: [p('biscuit-beagle')], rescuedOn: '14 Feb 2026',
          story: 'Found tied to a gate on Katipunan in the rain, with a rope that had worn through the fur on her neck.\n\nA neighbour called us at eleven at night. She would not eat for two days and flinched at every hand. Three weeks of soft food, a quiet foster room and one very patient volunteer later, she now steals socks and sleeps belly-up.' }),
        live('nimbus', { name: 'Nimbus', species: 'Dog', breed: 'Terrier mix', location: 'Marikina', photos: [p('nimbus-terrier')], rescuedOn: '2 Sep 2026',
          story: 'Pulled from a flooded lot in Marikina after the September rains, standing on a car tyre with water up to his chest.\n\nHis left hind leg had healed badly from an old break. He is waiting on surgery, which is what our current donation drive is for.' }),
        pending('patch', { name: 'Patch', species: 'Dog', breed: '', location: 'Pasig', photos: [p('patch-mix')], rescuedOn: '',
          story: 'Walked into a sari-sari store in Pasig and refused to leave until the owner called someone.\n\nSkin infection, ticks, very thin. Six weeks on, her coat is coming back in patches, which is where the name came from.' },
          { rescuedOn: '30 Aug 2026' }),
        draftOnly('juniper', { name: 'Juniper', species: 'Dog', breed: 'Beagle', location: 'Quezon City', photos: [p('pillow-beagle')], rescuedOn: '9 Oct 2026',
          story: 'Surrendered by a family who were moving abroad and could not take her.\n\nEight years old, house-trained, and confused about why her people left. She is settling in with our foster in Cubao.' }),
      ],
      adopt: [
        live('mango', { name: 'Mango', species: 'Dog', breed: 'Aspin', location: 'Pasig', photos: [p('mango-mix')], age: { mode: 'approx', text: 'About 2 years' }, sex: 'Male',
          personality: 'Calm indoors, goofy outdoors. Leans his whole weight on your legs when he wants attention. Fine with other dogs, has not met cats.',
          health: 'Neutered. Vaccinated (5-in-1, anti-rabies). Dewormed. Tick-free since August.' }),
        live('kiko', { name: 'Kiko', species: 'Dog', breed: 'Shiba mix', location: 'Quezon City', photos: [p('kiko-shiba')], age: { mode: 'range', band: '1-3y' }, sex: 'Male',
          personality: 'Independent and a little dramatic. Needs a home without small children; he does not love being picked up.', health: 'Neutered. Vaccinated. Mild skin allergy managed with diet.' }),
        live('saffron', { name: 'Saffron', species: 'Cat', breed: 'Puspin', location: 'Quezon City', photos: [p('saffron-kitten')], age: { mode: 'approx', text: 'About 3 months' }, sex: 'Female',
          personality: 'Fearless kitten. Climbs curtains, purrs like a motor, uses the litter box every time.', health: 'First vaccine done, second due 18 Nov. Spay booked once she is old enough.' }),
        live('bruno', { name: 'Bruno', species: 'Dog', breed: 'Pit bull mix', location: 'Antipolo', photos: [p('bruno-pit')], age: { mode: 'range', band: '3-7y' }, sex: 'Male',
          personality: 'A big softie who thinks he is a lap dog. Walks well on a leash. Best as the only dog.', health: 'Neutered. Vaccinated. Heartworm negative.' }),
        live('atlas', { name: 'Atlas', species: 'Dog', breed: 'German Shepherd', location: 'Marikina', photos: [p('atlas-shepherd')], age: { mode: 'approx', text: 'About 9 years' }, sex: 'Male',
          personality: 'Senior gentleman. Two slow walks a day and a soft bed is all he asks. House-trained.', health: 'Neutered. Vaccinated. Mild hip stiffness; on joint supplements.' }),
        live('tala', { name: 'Tala', species: 'Dog', breed: '', location: 'Quezon City', photos: [p('basket-puppy')], age: { mode: 'range', band: '6-12m' }, sex: 'Female',
          personality: 'Curious and food-motivated, which makes her easy to train. Still learning not to chew shoes.', health: 'Vaccinated. Spayed.' }),
        pending<AdoptionContent>('domino', { name: 'Domino', species: 'Dog', breed: '', location: 'Pasig', photos: [p('collie-pup')], age: { mode: 'unknown' }, sex: null,
          personality: 'Shy for the first hour, then your shadow forever.', health: 'Vaccinated.' },
          { age: { mode: 'approx', text: 'About 4 months' } }),
      ],
      prepare: PREPARE_STARTERS.map((c, i) => live(`prep-${i + 1}`, c)),
      stories: [
        live('s-koda', { title: 'Koda went home to a family with a backyard', body: 'Eight months with us, two failed meet-and-greets, then the Reyes family in Fairview walked in and he sat on their feet. Two months on, he has a sandpit, a best friend next door and opinions about the mail carrier.', adoptedOn: 'Sep 2026', photos: [p('koda-husky'), p('husky-grey'), p('snow-husky-pup'), p('pillow-beagle'), p('pippa-corgi')], adopter: 'the Reyes family', animal: 'Koda' }),
        live('s-yuki', { title: 'Yuki, from a box by the highway to a balcony in Makati', body: 'Found at four weeks old. Her adopter sends us a photo every Sunday, and this week she learned to sit for treats.', adoptedOn: 'Jul 2026', photos: [p('snow-husky-pup'), p('basket-puppy')], adopter: 'Carla', animal: 'Yuki' }),
        draftOnly('s-smoke', { title: 'Smoke learned to trust people again', body: '', adoptedOn: 'Oct 2026', photos: [p('husky-grey')], adopter: '', animal: 'Smoke' }),
      ],
      events: [
        live('e-market', { title: 'Adoption morning at the Diliman Sunday market', body: 'Meet Mango, Tala and Saffron in person. Bring a leash if you have one.', date: '2026-11-08', time: '9:00 am – 1:00 pm', where: 'UP Diliman, Quezon City' }),
        live('e-rabies', { title: 'Free anti-rabies vaccination drive', body: 'With the city veterinary office. Dogs and cats over three months.', date: '2026-11-22', time: '8:00 am – 12:00 noon', where: 'Barangay Concepcion Uno, Marikina' }),
      ],
      team: [
        ...TEAM_SAMPLES.map((c) => live(`t-${c.name.toLowerCase()}`, c)),
        draftOnly('t-paolo', { name: 'Paolo', role: 'Adoption interviews', bio: '', photo: null }),
      ],
      volunteer: [
        live('v-walkers', { title: 'Weekend dog walkers', body: 'Two hours on Saturday or Sunday morning in Cubao. No experience needed; we pair you with a regular.', commitment: '2 hrs / week' }),
        live('v-foster', { title: 'Kitten foster homes', body: 'Keep a litter for 4–8 weeks until they are old enough to adopt. We cover food, litter and vet bills.', commitment: '4–8 weeks' }),
        live('v-drivers', { title: 'Drivers for vet runs', body: 'A car and a free weekday morning, once or twice a month.', commitment: 'On call' }),
      ],
      donation: [
        live('d-nimbus', { title: "Surgery for Nimbus's hind leg", body: 'His old break healed crooked. Corrective surgery and two weeks of aftercare at a clinic in Marikina.', goal: 18000, raised: 11400, account: 'GCash · Second Wind Rescue', qr: { id: 'sample-qr', src: '/photos/sample-qr.svg' } }),
      ],
      guides: [
        live('g-first-week', { title: 'Your first week with a rescue dog', body: 'Why the first three days are quiet, where they should sleep, and when to start walks.', readTime: '6 min read' }),
        live('g-kitten', { title: 'Introducing a kitten to a resident cat', body: 'Scent swapping, the door-crack stage, and the signs it is going well.', readTime: '4 min read' }),
        live('g-ticks', { title: 'Tick season: what to check and when', body: 'Ears, between toes, under the collar. What the vet will ask you.', readTime: '3 min read' }),
      ],
      support: SUPPORT_SAMPLES.map((c, i) => live(`sup-${i + 1}`, c)),
    },
  };
}
