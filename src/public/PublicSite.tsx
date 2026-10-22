import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams, type Location } from 'react-router-dom';
import { useStore, useVisibleEntries } from '../state/store';
import { SECTION_ORDER, COMMUNITY_KEYS } from '../domain/sections';
import { EMPTY_FILTERS, filterAnimals, filterOptions } from '../domain/animals';
import type { AdoptionContent, AdoptionFilters, Collection } from '../domain/types';
import { Icon } from '../ui/Icon';
import { ButtonA, ButtonLink, Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { PublicCtx, usePublic } from './context';
import { AdoptionFiltersBar, AnimalCard, CommunityCard, GroupHeader, Monogram, PawMark, Ribbons, SectionHeading, StatTiles, mailto, messengerUrl } from './components';
import { AnimalDetailRoute } from './AnimalDetail';

/**
 * Everything a visitor sees at /:slug, and what a group sees at
 * /dashboard/preview. Same components; `preview` decides whether drafts show.
 */
export function PublicSite({ preview = false }: { preview?: boolean }) {
  const { state } = useStore();
  const { slug } = useParams();
  const location = useLocation();
  const base = preview ? '/dashboard/preview' : `/${state.page.slug}`;

  if (!preview && slug !== state.page.slug) return <NotFound />;
  if (!preview && !state.page.publishedAt) return <NotPublic />;

  const background = (location.state as { background?: Location } | null)?.background;

  return (
    <PublicCtx.Provider value={{ preview, base }}>
      <div className="kd-pub" data-gtheme={state.page.theme}>
        {preview ? <PreviewRibbon /> : null}
        <TopBar />
        <main id="main">
          <Routes location={background ?? location}>
            <Route index element={<Home />} />
            <Route path="rescues" element={<Gallery kind="rescues" />} />
            <Route path="rescues/:id" element={<><Gallery kind="rescues" /><AnimalDetailRoute kind="rescues" /></>} />
            <Route path="adopt" element={<Gallery kind="adopt" />} />
            <Route path="adopt/:id" element={<><Gallery kind="adopt" /><AnimalDetailRoute kind="adopt" /></>} />
            <Route path="*" element={<NotFoundInline />} />
          </Routes>
          {background ? (
            <Routes>
              <Route path="rescues/:id" element={<AnimalDetailRoute kind="rescues" />} />
              <Route path="adopt/:id" element={<AnimalDetailRoute kind="adopt" />} />
            </Routes>
          ) : null}
        </main>
        <Footer />
      </div>
    </PublicCtx.Provider>
  );
}

/** Sections a visitor would actually see: switched on AND with something in them. */
function useShownSections(): Collection[] {
  const { state } = useStore();
  const { preview } = usePublic();
  return SECTION_ORDER.map((s) => s.key).filter((k) => {
    if (!state.page.visible[k]) return false;
    return state.entries[k].some((e) => (preview ? (e.draft ?? e.published) : e.published) !== null);
  });
}

/** Section links scroll on the home page, and route home first from anywhere else. */
function useJump() {
  const { base } = usePublic();
  const navigate = useNavigate();
  const location = useLocation();
  const atHome = location.pathname === base || location.pathname === `${base}/`;
  const jump = (key: Collection) => (e: MouseEvent) => {
    e.preventDefault();
    if (!atHome) { navigate(base, { state: { anchor: key } }); return; }
    document.getElementById(`sec-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return { jump, atHome };
}

const TOPBAR_KEYS: Collection[] = ['rescues', 'adopt', 'stories', 'team', 'donation'];

function TopBar() {
  const { state } = useStore();
  const { base } = usePublic();
  const shown = useShownSections();
  const { jump, atHome } = useJump();
  const link = (k: Collection) => <a key={k} href={`#sec-${k}`} onClick={jump(k)}>{SECTION_ORDER.find((x) => x.key === k)!.short}</a>;
  const links = shown.map(link);
  // The desktop bar only has room for the essentials; the jump row and footer list every section.
  const keyLinks = shown.filter((k) => TOPBAR_KEYS.includes(k)).map(link);

  return (
    <>
      <a className="kd-skip" href="#main">Skip to content</a>
      <div className="kd-topbar">
        <Link className="kd-topbar__brand" to={base} aria-label={`${state.page.name} home`}>
          <Monogram page={state.page} className="kd-topbar__mono" /><span>{state.page.name}</span>
        </Link>
        <nav className="kd-topbar__links" aria-label="Page sections">{keyLinks}</nav>
        <div className="kd-topbar__end">
          {state.page.email ? <ButtonA variant="ink" size="s" iconEnd="mail" href={mailto(state.page.email)}>Contact</ButtonA> : null}
        </div>
      </div>
      {atHome ? <nav className="kd-jump" aria-label="Jump to section">{links}</nav> : null}
    </>
  );
}

function PreviewRibbon() {
  const { state } = useStore();
  return (
    <div className="kd-ribbon" role="note">
      <Icon name="lock" size={18} />
      <span><strong>Preview. </strong>{state.page.publishedAt ? 'Drafts and unpublished edits are shown here. Visitors only see published items.' : 'Your page is private until you publish it.'}</span>
      <ButtonLink variant="secondary" size="s" to="/dashboard">Back to dashboard</ButtonLink>
    </div>
  );
}

function Home() {
  const { state } = useStore();
  const { preview, base } = usePublic();
  const shown = useShownSections();
  const rescues = useVisibleEntries('rescues', preview);
  const adopt = useVisibleEntries('adopt', preview);
  const stories = useVisibleEntries('stories', preview);
  const location = useLocation();
  const adoptNames = shown.includes('adopt') ? adopt.map((a) => (a.content as AdoptionContent).name).filter(Boolean) : [];
  const navyPhoto = shown.includes('rescues') ? rescues.find((r) => r.content.photos[0])?.content.photos[0]?.src : undefined;

  // Arriving from a jump link on another page: scroll to that section.
  const anchor = (location.state as { anchor?: string } | null)?.anchor;
  useEffect(() => {
    if (anchor) document.getElementById(`sec-${anchor}`)?.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [anchor]);

  return (
    <>
      <GroupHeader page={state.page} adoptTo={shown.includes('adopt') ? `${base}/adopt` : undefined} />
      <StatTiles
        adoptCount={shown.includes('adopt') ? adopt.length : 0}
        rescueCount={shown.includes('rescues') ? rescues.length : 0}
        storyCount={shown.includes('stories') ? stories.length : 0}
        adoptTo={`${base}/adopt`} rescuesTo={`${base}/rescues`} photo={navyPhoto} />
      <Ribbons names={adoptNames} place={state.page.city || state.page.name} />
      {shown.includes('rescues') ? (
        <section className="kd-sec kd-sec--field-rescue" id="sec-rescues" aria-labelledby="h-rescues">
          <div className="kd-wrap">
            <SectionHeading id="h-rescues" title="Rescue Gallery" description="Where they came from." count={rescues.length} to={`${base}/rescues`} />
            <div className="kd-rail" style={{ ['--n' as string]: Math.min(4, rescues.length), ['--max' as string]: rescues.length >= 3 ? '1fr' : '360px' }}>
              {rescues.slice(0, 4).map((r) => <AnimalCard key={r.id} id={r.id} kind="rescues" content={r.content} status={r.status} />)}
            </div>
          </div>
        </section>
      ) : null}
      {shown.includes('adopt') ? (
        <section className="kd-sec kd-sec--field-adopt" id="sec-adopt" aria-labelledby="h-adopt">
          <div className="kd-wrap">
            <SectionHeading id="h-adopt" title="For Adoption" description="Looking for a home right now." count={adopt.length} to={`${base}/adopt`} />
            <div className="kd-grid kd-grid--4">
              {adopt.slice(0, 4).map((a) => <AnimalCard key={a.id} id={a.id} kind="adopt" content={a.content} status={a.status} />)}
            </div>
            <div style={{ marginTop: 24 }}>
              <ButtonLink variant="accent" iconEnd="chevron" to={`${base}/adopt`}>See all {adopt.length} {adopt.length === 1 ? 'animal' : 'animals'}</ButtonLink>
            </div>
          </div>
        </section>
      ) : null}
      {COMMUNITY_KEYS.filter((k) => shown.includes(k)).map((k) => <CommunitySection key={k} kind={k} />)}
      {shown.length === 0 ? (
        <div className="kd-wrap" style={{ paddingBottom: 40 }}>
          <EmptyState title="Nothing here yet" body={`${state.page.name} is still setting up this page. Reach them by email or Facebook in the meantime.`} />
        </div>
      ) : null}
    </>
  );
}

function CommunitySection({ kind }: { kind: (typeof COMMUNITY_KEYS)[number] }) {
  const { state } = useStore();
  const { preview } = usePublic();
  const items = useVisibleEntries(kind, preview);
  const label = SECTION_ORDER.find((s) => s.key === kind)!.label;
  const twoUp = kind === 'events' || kind === 'donation' || kind === 'stories';
  const field = { stories: 'kd-sec--field-stories', team: 'kd-sec--field-team', prepare: 'kd-sec--prepare' }[kind as string];
  const description = { prepare: 'What to think through before you apply.', team: 'The caretakers and volunteers behind every rescue.' }[kind as string];
  const layout = kind === 'prepare' ? 'kd-prepgrid' : kind === 'team' ? 'kd-teamrail' : twoUp ? 'kd-cols kd-cols--2' : 'kd-cols';
  return (
    <section className={['kd-sec', field].filter(Boolean).join(' ')} id={`sec-${kind}`} aria-labelledby={`h-${kind}`}>
      <div className="kd-wrap">
        <SectionHeading id={`h-${kind}`} title={label} description={description} />
        <div className={layout} style={{ ['--n' as string]: Math.min(kind === 'team' ? 4 : 3, items.length) }}>
          {items.map((it) => <CommunityCard key={it.id} kind={kind} item={it.content} page={state.page} status={it.status} />)}
        </div>
      </div>
    </section>
  );
}

function Gallery({ kind }: { kind: 'rescues' | 'adopt' }) {
  const { state } = useStore();
  const { preview, base } = usePublic();
  const entries = useVisibleEntries(kind, preview);
  const [filters, setFilters] = useState<AdoptionFilters>(EMPTY_FILTERS);
  useEffect(() => { window.scrollTo(0, 0); }, [kind]);

  const animals = entries.map((e) => ({ ...(e.content as AdoptionContent), __id: e.id, __status: e.status }));
  const opts = useMemo(() => filterOptions(animals), [entries]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = kind === 'adopt' ? filterAnimals(animals, filters) : animals;
  const hidden = !state.page.visible[kind];

  return (
    <section className="kd-sec kd-sec--page" aria-labelledby="h-gallery">
      <div className="kd-wrap">
        <Link className="kd-sh__all kd-back" to={base}><Icon name="back" size={18} />{state.page.name}</Link>
        <SectionHeading id="h-gallery" level={1}
          title={kind === 'adopt' ? 'For Adoption' : 'Rescue Gallery'}
          description={kind === 'adopt' ? 'Ready for a home. Open an animal for personality, health and how to reach us.' : `Every animal we've pulled off the street, and how they got here. ${entries.length} ${entries.length === 1 ? 'story' : 'stories'}.`} />
        {hidden && !preview ? (
          <EmptyState title="This section isn't shown right now" body="The group has hidden it for the moment." />
        ) : (
          <>
            {kind === 'adopt' && entries.length > 0 ? (
              <div style={{ marginBottom: 24 }}>
                <AdoptionFiltersBar value={filters} onChange={setFilters} resultCount={list.length} species={opts.species} locations={opts.locations} />
              </div>
            ) : null}
            {list.length ? (
              <div className="kd-grid kd-grid--4">
                {list.map((a) => <AnimalCard key={a.__id} id={a.__id} kind={kind} content={a} status={a.__status} />)}
              </div>
            ) : entries.length ? (
              <EmptyState icon="filter" title="No animals match those filters" body="Try a wider age range or another area. New animals are added most weeks."
                action={<Button variant="secondary" size="s" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button>} />
            ) : (
              <EmptyState title={kind === 'adopt' ? 'No animals listed right now' : 'No rescue stories yet'} body="Check back soon, or ask the group directly." />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Footer() {
  const { state } = useStore();
  const p = state.page;
  const shown = useShownSections();
  const { jump } = useJump();
  return (
    <footer className="kd-foot">
      <div className="kd-wrap">
        <div className="kd-foot__panel">
          <p className="kd-foot__name">{p.name}</p>
          <div className="kd-foot__side">
            {p.email || p.facebook ? <p className="kd-foot__lede">Questions about an animal, or how you can help? Write to us. A volunteer usually replies within a day.</p> : null}
            <div className="kd-foot__row">
              {p.email ? <ButtonA variant="lime" href={mailto(p.email)}>{p.email}<PawMark size={18} /></ButtonA> : null}
              {p.facebook ? <ButtonA variant="secondary" icon="chat" href={messengerUrl(p.facebook)} target="_blank" rel="noopener noreferrer">Message on Facebook</ButtonA> : null}
            </div>
          </div>
        </div>
        {shown.length ? (
          <nav className="kd-tags" aria-label="Sections">
            {shown.map((k) => <a key={k} href={`#sec-${k}`} onClick={jump(k)}>{SECTION_ORDER.find((x) => x.key === k)!.short}</a>)}
          </nav>
        ) : null}
        <div className="kd-foot__small"><span>{p.city}</span><Link to="/">Made with Kindred</Link></div>
      </div>
    </footer>
  );
}

function NotPublic() {
  return (
    <div className="kd-center-page">
      <EmptyState icon="lock" title="This page isn't public yet" body="The rescue group is still setting it up. Check back soon." />
    </div>
  );
}
function NotFound() {
  return (
    <div className="kd-center-page">
      <EmptyState title="We couldn't find that page" body="Check the link you were given. Rescue group pages look like kindred.ph/group-name." />
    </div>
  );
}
function NotFoundInline() {
  const { base } = usePublic();
  return (
    <div className="kd-wrap" style={{ padding: '48px 16px' }}>
      <EmptyState title="That page doesn't exist" action={<ButtonLink variant="secondary" size="s" to={base}>Go to the group's page</ButtonLink>} />
    </div>
  );
}
