import { Link, useLocation } from 'react-router-dom';
import type { AdoptionContent, AdoptionFilters, GroupPage, RescueContent, StoryContent, EventContent, VolunteerContent, DonationContent, GuideContent, CommunityCollection, PrepareContent, TeamContent } from '../domain/types';
import { AGE_FILTER_OPTIONS, EMPTY_FILTERS, factsLine } from '../domain/animals';
import { Icon } from '../ui/Icon';
import { ButtonA, Button, ButtonLink } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import type { EntryStatus } from '../domain/types';
import { usePublic } from './context';

export const facebookUrl = (handle: string) => `https://www.facebook.com/${handle.replace(/^.*facebook\.com\//, '').replace(/^@/, '')}`;
export const messengerUrl = (handle: string) => `https://m.me/${handle.replace(/^.*facebook\.com\//, '').replace(/^@/, '')}`;
export const mailto = (email: string, subject?: string) => `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export function Monogram({ page, className }: { page: GroupPage; className?: string }) {
  const letters = page.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'K';
  return page.logo
    ? <img className={className} src={page.logo.src} alt="" />
    : <span className={className} aria-hidden="true">{letters}</span>;
}

/* ---------- Brand shapes: crisp vector marks, never pictures ---------- */
export function PawMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <ellipse cx="7.6" cy="8.4" rx="2.1" ry="2.6" transform="rotate(-12 7.6 8.4)" />
      <ellipse cx="16.4" cy="8.4" rx="2.1" ry="2.6" transform="rotate(12 16.4 8.4)" />
      <ellipse cx="4" cy="13.2" rx="1.9" ry="2.3" transform="rotate(-28 4 13.2)" />
      <ellipse cx="20" cy="13.2" rx="1.9" ry="2.3" transform="rotate(28 20 13.2)" />
      <path d="M12 12.2c-3 0-5.4 3.1-5.4 5.3 0 1.6 1.2 2.6 2.8 2.6 1.1 0 1.7-.5 2.6-.5s1.5.5 2.6.5c1.6 0 2.8-1 2.8-2.6 0-2.2-2.4-5.3-5.4-5.3z" />
    </svg>
  );
}
function HeartShape({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 40 36" aria-hidden="true"><path fill="currentColor" d="M20 35C8 26 1 19.5 1 11.2 1 5.5 5.3 1 10.8 1c3.9 0 7.2 2.3 9.2 5.6C22 3.3 25.3 1 29.2 1 34.7 1 39 5.5 39 11.2 39 19.5 32 26 20 35z" /></svg>;
}
function BoneShape({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
      <path d="M30 22H90a10 10 0 1 1 13 9.6A10 10 0 1 1 90 38H30a10 10 0 1 1-13-9.6A10 10 0 1 1 30 22z" />
    </svg>
  );
}

/** Small round paw that sits notched into a card's corner and turns on hover. */
export function PawBadge() {
  return <span className="kd-pawbadge" aria-hidden="true"><PawMark size={26} /></span>;
}

/** Soft five-lobed blob (Lucky Paw hero shape), drawn in a 400 × 400 box. */
const HERO_BLOB = 'M200 8C233.4 8 260 48.3 292.9 72.2C325.7 96.1 372.3 108.9 382.6 140.7C392.9 172.5 362.8 210.2 350.3 248.8C337.7 287.5 339.9 335.7 312.9 355.3C285.8 375 240.6 358 200 358C159.4 358 114.2 375 87.1 355.3C60.1 335.7 62.3 287.5 49.7 248.8C37.2 210.2 7.1 172.5 17.4 140.7C27.7 108.9 74.3 96.1 107.1 72.2C140 48.3 166.6 8 200 8Z';

export function GroupHeader({ page, adoptTo }: { page: GroupPage; adoptTo?: string }) {
  return (
    <header className="kd-hero">
      <div className="kd-wrap kd-hero__inner">
        <div className="kd-hero__text">
          <h1 className="kd-hero__name">{page.name}</h1>
          {page.city ? <p className="kd-hero__where"><Icon name="pin" size={18} />{page.city}</p> : null}
          {page.intro ? <p className="kd-hero__intro">{page.intro}</p> : null}
          <div className="kd-hero__actions">
            {adoptTo ? <ButtonLink variant="accent" to={adoptTo} iconEnd="chevron">Meet the animals</ButtonLink> : null}
            {page.email ? <ButtonA variant="secondary" icon="mail" href={mailto(page.email)}>Email us</ButtonA> : null}
            {page.facebook ? <ButtonA variant="secondary" icon="chat" href={messengerUrl(page.facebook)} target="_blank" rel="noopener noreferrer">Message on Facebook</ButtonA> : null}
          </div>
        </div>
        <div className="kd-hero__art">
          {/* The banner is cut into the blob itself, with a turned partner-colour blob behind it */}
          <svg className="kd-hero__shape" viewBox="0 0 400 400" aria-hidden="true">
            <defs><clipPath id="kd-hero-clip"><path d={HERO_BLOB} /></clipPath></defs>
            <path className="kd-hero__back" d={HERO_BLOB} />
            <g className="kd-hero__pic" clipPath="url(#kd-hero-clip)">
              <rect className="kd-hero__fill" width="400" height="400" />
              {page.banner ? <image href={page.banner.src} width="400" height="400" preserveAspectRatio="xMidYMid slice" /> : null}
            </g>
          </svg>
          {!page.banner ? <span className="kd-hero__ph"><PawMark size={112} /></span> : null}
          <HeartShape className="kd-hero__heart kd-hero__heart--a" />
          <HeartShape className="kd-hero__heart kd-hero__heart--b" />
          <BoneShape className="kd-hero__bone" />
          <div className="kd-hero__logo" role="img" aria-label={`${page.name} logo`}><Monogram page={page} className="kd-gh__logoimg" /></div>
        </div>
      </div>
    </header>
  );
}

/** Real counts from the page's own lists. A tile with nothing to count is left out. */
export function StatTiles({ adoptCount, rescueCount, storyCount, adoptTo, rescuesTo, photo }: {
  adoptCount: number; rescueCount: number; storyCount: number; adoptTo: string; rescuesTo: string; photo?: string;
}) {
  if (!adoptCount && !rescueCount && !storyCount) return null;
  return (
    <div className="kd-wrap">
      <div className="kd-stats">
        {adoptCount ? (
          <Link className="kd-stat kd-stat--lime" to={adoptTo}>
            <b>{adoptCount}</b><span>{adoptCount === 1 ? 'animal looking for a home' : 'animals looking for a home'}</span><PawBadge />
          </Link>
        ) : null}
        {rescueCount ? (
          <Link className="kd-stat kd-stat--navy" to={rescuesTo}>
            {photo ? <img className="kd-stat__img" src={photo} alt="" loading="lazy" /> : null}
            <b>{rescueCount}</b><span>{rescueCount === 1 ? 'rescue story' : 'rescue stories'}</span><PawBadge />
          </Link>
        ) : null}
        {storyCount ? (
          <div className="kd-stat kd-stat--peri">
            <b>{storyCount}</b><span>{storyCount === 1 ? 'happy ending so far' : 'happy endings so far'}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Two crossed, slowly scrolling bands. Decorative: the same names are on the cards below. */
export function Ribbons({ names, place }: { names: string[]; place: string }) {
  if (!names.length) return null;
  const run = (items: string[]) => items.flatMap((t, i) => [<span key={`t${i}`}>{t}</span>, <PawMark key={`p${i}`} size={18} className="kd-band__paw" />]);
  const a = run(names.map((n) => `${n} is waiting for you`));
  const b = run(names.map((n) => `Meet ${n} · ${place}`));
  return (
    <div className="kd-bands" aria-hidden="true">
      <div className="kd-band kd-band--a"><div className="kd-band__track"><div>{a}</div><div>{a}</div></div></div>
      <div className="kd-band kd-band--b"><div className="kd-band__track"><div>{b}</div><div>{b}</div></div></div>
    </div>
  );
}

export function SectionHeading({ id, title, description, count, to, level = 2 }: { id: string; title: string; description?: string; count?: number; to?: string; level?: 1 | 2 }) {
  const H = level === 1 ? 'h1' : 'h2';
  return (
    <div className="kd-sh">
      <div>
        <H className="kd-sh__title" id={id}>{title}</H>
        {description ? <p className="kd-sh__desc">{description}</p> : null}
      </div>
      {to ? <Link className="kd-sh__all" to={to}>View all{count != null ? ` ${count}` : ''}<Icon name="chevron" size={18} /></Link> : null}
    </div>
  );
}

/** Card links carry the current location as `background`, so the overlay opens over this page. */
export function AnimalCard({ id, kind, content, status }: { id: string; kind: 'rescues' | 'adopt'; content: RescueContent | AdoptionContent; status?: EntryStatus }) {
  const { base, preview } = usePublic();
  const location = useLocation();
  const cover = content.photos[0];
  const to = `${base}/${kind}/${id}`;
  if (kind === 'rescues') {
    const r = content as RescueContent;
    return (
      <Link className="kd-card kd-card--rescue" to={to} state={{ background: location }} aria-label={`${r.name || 'Untitled'}, rescue story`}>
        <div className="kd-card__media">
          {cover ? <img src={cover.src} alt="" loading="lazy" decoding="async" /> : null}
          {preview && status && status !== 'live' ? <StatusBadge status={status} className="kd-card__badge" /> : null}
          <div className="kd-card__over">
            <p className="kd-card__name">{r.name || 'Untitled'}</p>
            <p className="kd-card__meta">{r.rescuedOn ? `Rescued ${r.rescuedOn}` : r.location}</p>
          </div>
        </div>
      </Link>
    );
  }
  const a = content as AdoptionContent;
  const facts = factsLine(a);
  return (
    <Link className="kd-card kd-card--adoption" to={to} state={{ background: location }} aria-label={[a.name || 'Untitled', facts, a.location].filter(Boolean).join(', ')}>
      <div className="kd-card__media">
        {cover ? <img src={cover.src} alt="" loading="lazy" decoding="async" /> : null}
        {preview && status && status !== 'live' ? <StatusBadge status={status} className="kd-card__badge" /> : null}
      </div>
      <div className="kd-card__body">
        <p className="kd-card__name">{a.name || 'Untitled'}</p>
        <p className="kd-card__facts">{facts || 'Details coming soon'}</p>
        {a.location ? <p className="kd-card__where"><Icon name="pin" size={16} />{a.location}</p> : null}
        <span className="kd-card__cta" aria-hidden="true">Meet {a.name || 'them'}</span>
      </div>
    </Link>
  );
}

export function AdoptionFiltersBar({ value, onChange, resultCount, species, locations }: {
  value: AdoptionFilters; onChange: (f: AdoptionFilters) => void; resultCount: number; species: string[]; locations: string[];
}) {
  const active = value.species !== 'all' || value.age !== 'any' || value.location !== 'any';
  const plural = (s: string) => (/s$/i.test(s) ? s : `${s}s`);
  return (
    <div className="kd-filters" role="search" aria-label="Filter animals for adoption">
      <div className="kd-filters__row" role="group" aria-label="Animal type">
        {['all', ...species].map((s) => (
          <button key={s} type="button" className="kd-chip" aria-pressed={value.species === s}
            onClick={() => onChange({ ...value, species: s })}>{s === 'all' ? 'All animals' : plural(s)}</button>
        ))}
      </div>
      <div className="kd-filters__selects">
        <div className="kd-selectwrap">
          <label className="kd-sr" htmlFor="f-age">Age</label>
          <select id="f-age" className="kd-select" value={value.age} onChange={(e) => onChange({ ...value, age: e.target.value as AdoptionFilters['age'] })}>
            <option value="any">Any age</option>
            {AGE_FILTER_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
          <Icon name="down" size={18} />
        </div>
        <div className="kd-selectwrap">
          <label className="kd-sr" htmlFor="f-loc">Location</label>
          <select id="f-loc" className="kd-select" value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })}>
            <option value="any">Anywhere</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Icon name="down" size={18} />
        </div>
      </div>
      <div className="kd-filters__summary">
        <span aria-live="polite"><strong>{resultCount}</strong>{resultCount === 1 ? ' animal' : ' animals'}{active ? (resultCount === 1 ? ' matches' : ' match') : (resultCount === 1 ? ' is looking for a home' : ' looking for a home')}</span>
        {active ? <Button variant="ghost" size="s" onClick={() => onChange(EMPTY_FILTERS)}>Clear filters</Button> : null}
      </div>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dateParts(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { day: String(Number(m[3])), month: MONTHS[Number(m[2]) - 1] ?? '', year: m[1] };
}
const peso = (n: number) => `₱${Math.round(n).toLocaleString('en-PH')}`;

export function CommunityCard({ kind, item, page, status }: { kind: CommunityCollection; item: unknown; page: GroupPage; status?: EntryStatus }) {
  const { preview } = usePublic();
  const badge = preview && status && status !== 'live' ? <div><StatusBadge status={status} /></div> : null;
  if (kind === 'prepare') {
    const pr = item as PrepareContent;
    return (
      <article className="kd-prep">
        <span className="kd-prep__icon" aria-hidden="true"><Icon name={pr.icon} size={28} strokeWidth={1.6} /></span>
        {badge}
        <h3 className="kd-prep__title">{pr.title || 'Untitled point'}</h3>
        {pr.body ? <p className="kd-prep__body">{pr.body}</p> : null}
      </article>
    );
  }
  if (kind === 'team') {
    const t = item as TeamContent;
    const initials = t.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
    return (
      <article className="kd-member">
        <div className="kd-member__photo">
          {t.photo ? <img src={t.photo.src} alt={t.name ? `${t.name}, ${t.role || 'team member'}` : ''} loading="lazy" />
            : <span className="kd-member__initials" aria-hidden="true">{initials}<PawMark size={34} className="kd-member__paw" /></span>}
          {badge ? <div className="kd-card__badge">{badge}</div> : null}
        </div>
        <h3 className="kd-member__name">{t.name || 'Unnamed'}</h3>
        {t.role ? <p className="kd-member__role">{t.role}</p> : null}
        {t.bio ? <p className="kd-member__bio">{t.bio}</p> : null}
      </article>
    );
  }
  if (kind === 'stories') {
    const s = item as StoryContent;
    const shown = s.photos.slice(0, 3);
    const more = s.photos.length - shown.length;
    const byline = [s.animal, s.adopter && `from ${s.adopter}`, s.adoptedOn].filter(Boolean).join(' · ');
    return (
      <article className="kd-update">
        {shown.length ? (
          <div className="kd-mosaic" data-count={shown.length}>
            {shown.map((ph, i) => (
              <div className="kd-mosaic__cell" key={ph.id + i}>
                <img src={ph.src} alt={i === 0 && s.animal ? `${s.animal} at home` : ''} loading="lazy" />
                {i === shown.length - 1 && more > 0 ? <span className="kd-mosaic__more">+{more}<span className="kd-sr"> more photos</span></span> : null}
              </div>
            ))}
          </div>
        ) : null}
        {badge}
        <h3 className="kd-update__title">{s.title || 'Untitled update'}</h3>
        {byline ? <p className="kd-update__by"><Icon name="heart" size={16} />{byline}</p> : null}
        {s.body ? <p className="kd-update__body">{s.body}</p> : null}
      </article>
    );
  }
  if (kind === 'events') {
    const e = item as EventContent;
    const d = dateParts(e.date);
    return (
      <article className="kd-cc kd-cc--event">
        <div className="kd-cc__date" aria-hidden="true">{d ? <div><b>{d.day}</b><small>{d.month.toUpperCase()}</small></div> : <Icon name="calendar" size={24} />}</div>
        <div className="kd-stack" style={{ gap: 8 }}>
          {badge}
          <h3 className="kd-cc__title">{e.title || 'Untitled event'}</h3>
          <div className="kd-cc__meta">
            {d || e.time ? <span><Icon name="calendar" size={16} />{[d && `${d.day} ${d.month} ${d.year}`, e.time].filter(Boolean).join(' · ')}</span> : null}
            {e.where ? <span><Icon name="pin" size={16} />{e.where}</span> : null}
          </div>
          {e.body ? <p className="kd-cc__body">{e.body}</p> : null}
        </div>
      </article>
    );
  }
  if (kind === 'donation') {
    const d = item as DonationContent;
    const pct = d.goal > 0 ? Math.min(100, Math.round((d.raised / d.goal) * 100)) : 0;
    return (
      <article className="kd-cc kd-cc--donation">
        <PawBadge />
        {badge}
        <h3 className="kd-cc__title">{d.title || 'Untitled campaign'}</h3>
        {d.body ? <p className="kd-cc__body">{d.body}</p> : null}
        {d.goal > 0 ? (
          <div>
            <div className="kd-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Raised so far"><i style={{ width: `${pct}%` }} /></div>
            <p className="kd-cc__meta" style={{ marginTop: 8 }}><span><strong style={{ color: 'var(--ink)' }}>{peso(d.raised)}</strong> raised of {peso(d.goal)}</span></p>
          </div>
        ) : null}
        <div className="kd-cc__qr">
          {d.qr ? <img className="kd-cc__qrimg" src={d.qr.src} alt={`QR code for ${d.account || 'donations'}`} /> : null}
          <p className="kd-cc__body">
            <strong>{d.qr ? 'Scan to give' : 'How to give'}</strong><br />{d.account}<br />
            <span style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Kindred does not process payments. Send {page.name} a screenshot so they can thank you.</span>
          </p>
        </div>
      </article>
    );
  }
  if (kind === 'volunteer') {
    const v = item as VolunteerContent;
    return (
      <article className="kd-cc kd-cc--volunteer">
        <PawBadge />
        {badge}
        <h3 className="kd-cc__title">{v.title || 'Untitled role'}</h3>
        {v.body ? <p className="kd-cc__body">{v.body}</p> : null}
        {v.commitment ? <div className="kd-cc__meta"><span><Icon name="clock" size={16} />{v.commitment}</span></div> : null}
        {page.email ? <a className="kd-cc__link" href={mailto(page.email, `Volunteering: ${v.title}`)}>Email to sign up</a> : null}
      </article>
    );
  }
  const g = item as GuideContent;
  return (
    <article className="kd-cc">
      {badge}
      <h3 className="kd-cc__title">{g.title || 'Untitled guide'}</h3>
      {g.body ? <p className="kd-cc__body" style={{ whiteSpace: 'pre-line' }}>{g.body}</p> : null}
      {g.readTime ? <div className="kd-cc__meta"><span><Icon name="book" size={16} />{g.readTime}</span></div> : null}
    </article>
  );
}
