import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../state/store';
import { SECTION_ORDER, COMMUNITY_KEYS, sectionLabel } from '../domain/sections';
import { entryStatus, previewContent, sameContent } from '../domain/publishing';
import { ageLabel } from '../domain/animals';
import type { Collection, ContentByCollection, Entry, GroupPage } from '../domain/types';
import { newId, nowIso } from '../lib/ids';
import { useToast } from '../ui/Toast';
import { Icon } from '../ui/Icon';
import { Button, ButtonLink } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { TextArea, TextField, ChoiceGroup } from '../ui/Field';
import { PhotoInput } from '../ui/PhotoInput';
import { EmptyState } from '../ui/EmptyState';
import { Monogram } from '../public/components';
import { SectionToggle, ThemePicker } from './parts';
import { EditorRoute } from './Editor';
import { blankContent } from './blank';
import { PREPARE_STARTERS, TEAM_SAMPLES } from '../data/seed';

const NAV = [
  { to: '/dashboard', label: 'Page', icon: 'layout', end: true },
  { to: '/dashboard/animals', label: 'Animals', icon: 'paw' },
  { to: '/dashboard/community', label: 'Community', icon: 'users' },
  { to: '/dashboard/account', label: 'Account', icon: 'gear' },
];

export function Dashboard() {
  const { state, dispatch } = useStore();
  const location = useLocation();

  // Drop "Add" clicks that were never filled in, once you leave the editor.
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/edit/')) return;
    (Object.keys(state.entries) as Collection[]).forEach((c) => {
      (state.entries[c] as Entry<unknown>[]).forEach((e) => {
        if (e.published === null && sameContent(e.draft, blankContent(c))) dispatch({ type: 'entry/delete', collection: c, id: e.id });
      });
    });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="kd-dash" data-gtheme={state.page.theme}>
      <a className="kd-skip" href="#dash-main">Skip to content</a>
      <nav className="kd-dash__nav" aria-label="Dashboard">
        <div className="kd-dash__navbrand"><Monogram page={state.page} className="kd-topbar__mono" /><span>{state.page.name}</span></div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            <Icon name={n.icon} size={22} />{n.label}
          </NavLink>
        ))}
      </nav>
      <div className="kd-dash__body" id="dash-main">
        <Routes>
          <Route index element={<Screen title="Your page"><PageTab /></Screen>} />
          <Route path="animals" element={<Screen title="Animals"><EntriesTab groups={['adopt', 'rescues']} /></Screen>} />
          <Route path="community" element={<Screen title="Community"><EntriesTab groups={COMMUNITY_KEYS} /></Screen>} />
          <Route path="account" element={<Screen title="Account"><AccountTab /></Screen>} />
          <Route path="edit/:collection/:id" element={<div className="kd-dash__main kd-dash__main--edit"><div className="kd-span"><EditorRoute /></div></div>} />
          <Route path="*" element={<Screen title="Not found"><EmptyState title="That screen doesn't exist" action={<ButtonLink variant="secondary" size="s" to="/dashboard">Go to your page</ButtonLink>} /></Screen>} />
        </Routes>
      </div>
    </div>
  );
}

function Screen({ title, children }: { title: string; children: React.ReactNode }) {
  useEffect(() => { document.title = `${title} · Kindred`; window.scrollTo(0, 0); }, [title]);
  return (
    <>
      <div className="kd-dash__top">
        <h1 className="kd-dash__title">{title}</h1>
        <div style={{ marginLeft: 'auto' }}><ButtonLink variant="ghost" size="s" icon="eye" to="/dashboard/preview">Preview</ButtonLink></div>
      </div>
      <div className="kd-dash__main">{children}</div>
    </>
  );
}

const SAMPLES: Partial<Record<Collection, ContentByCollection[Collection][]>> = { team: TEAM_SAMPLES, prepare: PREPARE_STARTERS.slice(0, 3) };

const count = (list: Entry<unknown>[], s?: 'draft' | 'pending') =>
  list.filter((e) => (s ? entryStatus(e) === s : e.published !== null)).length;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function PageTab() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const p = state.page;
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const update = (patch: Partial<Omit<GroupPage, 'visible' | 'publishedAt' | 'slug'>>) => dispatch({ type: 'page/update', patch });

  const publishedAnimals = count(state.entries.adopt) + count(state.entries.rescues);
  const checklist = [
    { label: 'Page name', done: p.name.trim().length > 0, required: true },
    { label: 'A contact email', done: isEmail(p.email), required: true },
    { label: 'Introduction', done: p.intro.trim().length > 0 },
    { label: 'At least one published animal', done: publishedAnimals > 0 },
  ];
  const canPublish = checklist.every((c) => !c.required || c.done);
  const url = `${window.location.origin}/${p.slug}`;

  async function copy() {
    try { await navigator.clipboard.writeText(url); toast('Link copied. Paste it in your Facebook bio.'); }
    catch { toast("Couldn't copy. Select the link and copy it by hand.", { tone: 'error' }); }
  }
  function toggle(key: Collection, on: boolean) {
    dispatch({ type: 'section/set', key, visible: on });
    toast(`${sectionLabel(key)} is ${on ? 'shown on' : 'hidden from'} your page.`, {
      actionLabel: 'Undo', onAction: () => dispatch({ type: 'section/set', key, visible: !on }),
    });
  }

  return (
    <>
      {p.publishedAt ? (
        <section className="kd-status kd-status--live kd-span" aria-labelledby="st-h">
          <div><StatusBadge status="live">Page is live</StatusBadge></div>
          <h2 id="st-h">Visitors can see your page</h2>
          <div className="kd-url"><Icon name="home" size={18} /><span>{url.replace(/^https?:\/\//, '')}</span><Button variant="ghost" size="s" icon="copy" onClick={copy}>Copy</Button></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ButtonLink variant="secondary" icon="eye" to={`/${p.slug}`}>View live page</ButtonLink>
            <Button variant="ghost" onClick={() => { dispatch({ type: 'page/unpublish' }); toast('Your page is private again.', { actionLabel: 'Undo', onAction: () => dispatch({ type: 'page/publish', now: nowIso() }) }); }}>Make private</Button>
          </div>
        </section>
      ) : (
        <section className="kd-status kd-status--private kd-span" aria-labelledby="st-h">
          <div><StatusBadge status="private" /></div>
          <h2 id="st-h">Only you can see your page</h2>
          <p>Publishing makes it public at <strong>{url.replace(/^https?:\/\//, '')}</strong>. After that, each animal and post is published on its own, so you can keep working on drafts.</p>
          <ul className="kd-check">
            {checklist.map((c) => (
              <li key={c.label} data-done={c.done}>
                <Icon name={c.done ? 'check' : c.required ? 'alert' : 'plus'} size={18} strokeWidth={2.25} />
                {c.label}{!c.done ? <span className="kd-muted">{c.required ? ' · needed to publish' : ' · recommended'}</span> : null}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ButtonLink variant="secondary" icon="eye" to="/dashboard/preview">Preview</ButtonLink>
            <Button variant="primary" disabled={!canPublish} aria-describedby={!canPublish ? 'pub-why' : undefined}
              onClick={() => { dispatch({ type: 'page/publish', now: nowIso() }); toast(`Your page is live at ${url.replace(/^https?:\/\//, '')}`, { duration: 5000 }); }}>Publish page</Button>
          </div>
          {!canPublish ? <p id="pub-why" className="kd-muted">Add the items marked “needed to publish” first.</p> : null}
        </section>
      )}

      <section className="kd-panel" aria-labelledby="sec-h">
        <div className="kd-panel__h"><h2 id="sec-h">Page sections</h2></div>
        <p className="kd-panel__sub">Show or hide each section. The order is the same on every Kindred page, so visitors always know where to look.</p>
        {SECTION_ORDER.map((s, i) => {
          const list = state.entries[s.key] as Entry<unknown>[];
          return <SectionToggle key={s.key} id={s.key} position={i + 1} label={s.label} checked={p.visible[s.key]} onChange={(on) => toggle(s.key, on)} publishedCount={count(list)} draftCount={count(list, 'draft')} />;
        })}
      </section>

      <section className="kd-panel" aria-labelledby="look-h">
        <div className="kd-panel__h"><h2 id="look-h">Look and introduction</h2></div>
        <p className="kd-panel__sub">{p.publishedAt ? 'Changes here go live straight away.' : 'Changes here show on your page once you publish it.'}</p>
        <div className="kd-form">
          <TextField label="Page name" value={p.name} onChange={(e) => update({ name: e.target.value })} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={touched.name && !p.name.trim() ? 'Add a name. It’s the first thing visitors read.' : null} />
          <TextArea label="Introduction" rows={4} maxLength={300} value={p.intro} onChange={(e) => update({ intro: e.target.value })}
            hint={`${300 - p.intro.length} characters left. Who you are, where you work, what you need most.`} />
          <TextField label="City or area" value={p.city} onChange={(e) => update({ city: e.target.value })} placeholder="Quezon City, Metro Manila" />
          <TextField label="Contact email" type="email" autoComplete="email" value={p.email} onChange={(e) => update({ email: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={touched.email && !isEmail(p.email) ? 'Enter an email like name@example.com.' : null}
            hint="Visitors email this address about animals." />
          <TextField label="Facebook page" value={p.facebook} onChange={(e) => update({ facebook: e.target.value })} placeholder="yourpage" optional
            hint="The part after facebook.com/. Visitors get a Messenger button that opens a chat with you." />
          <ChoiceGroup legend="Logo" optional hint="Square works best. Without one, we show your initials.">
            <PhotoInput single photos={p.logo ? [p.logo] : []} onChange={(ph) => update({ logo: ph[0] ?? null })} label="Upload logo" />
          </ChoiceGroup>
          <ChoiceGroup legend="Banner" optional hint="A wide photo, at least 1600 px across.">
            <PhotoInput single photos={p.banner ? [p.banner] : []} onChange={(ph) => update({ banner: ph[0] ?? null })} label="Upload banner" />
          </ChoiceGroup>
          <ThemePicker value={p.theme} onChange={(theme) => update({ theme })} />
        </div>
      </section>
    </>
  );
}

function EntriesTab({ groups }: { groups: Collection[] }) {
  const toast = useToast();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const show = (groups.includes(params.get('show') as Collection) ? params.get('show') : groups[0]) as Collection;
  const list = state.entries[show] as Entry<ContentByCollection[Collection]>[];

  function add() {
    const id = newId(show);
    dispatch({ type: 'entry/create', collection: show, id, content: blankContent(show), now: nowIso() });
    navigate(`/dashboard/edit/${show}/${id}`);
  }
  /** Drafts only: samples never reach visitors until the group publishes them. */
  function addSamples() {
    const samples = SAMPLES[show] ?? [];
    samples.forEach((content) => dispatch({ type: 'entry/create', collection: show, id: newId(show), content, now: nowIso() }));
    toast(`Added ${samples.length} sample ${samples.length === 1 ? 'entry' : 'entries'} as drafts. Edit or publish them when you’re ready.`);
  }

  return (
    <section className="kd-panel kd-span" aria-label={sectionLabel(show)}>
      <div className="kd-tabs" role="tablist" aria-label="Lists">
        {groups.map((g) => (
          <button key={g} role="tab" type="button" aria-selected={g === show} onClick={() => setParams({ show: g }, { replace: true })}>{sectionLabel(g)}</button>
        ))}
      </div>
      <div className="kd-list__head">
        <p className="kd-panel__sub" style={{ margin: 0 }}>
          {count(list)} published · {count(list, 'draft')} draft{count(list, 'pending') ? ` · ${count(list, 'pending')} with unpublished edits` : ''}
          {!state.page.visible[show] ? ' · section hidden' : ''}
        </p>
        <Button variant="primary" size="s" icon="plus" onClick={add}>Add</Button>
      </div>
      {list.length ? (
        <ul className="kd-list" role="list">
          {list.map((e) => {
            const c = previewContent(e) as unknown as Record<string, unknown> & { photos?: { src: string }[]; qr?: { src: string } | null; photo?: { src: string } | null };
            const status = entryStatus(e);
            const name = (c.name as string) || (c.title as string) || 'Untitled';
            const meta = show === 'adopt' ? [c.species, ageLabel((c as unknown as ContentByCollection['adopt']).age), c.location].filter(Boolean).join(' · ')
              : show === 'stories' ? [c.animal, c.adopter && `from ${c.adopter}`, c.adoptedOn, c.photos?.length ? `${c.photos.length} ${c.photos.length === 1 ? 'photo' : 'photos'}` : ''].filter(Boolean).join(' · ')
              : (c.role as string) || (c.location as string) || (c.where as string) || (c.commitment as string) || (c.readTime as string) || (c.account as string) || '';
            const thumb = c.photos?.[0]?.src ?? c.qr?.src ?? c.photo?.src;
            const placeholder = show === 'prepare' ? (c.icon as string) : show === 'events' ? 'calendar' : show === 'donation' ? 'gift' : show === 'guides' ? 'book' : 'users';
            return (
              <li className="kd-row" key={e.id}>
                <Link className="kd-row__btn" to={`/dashboard/edit/${show}/${e.id}`}>
                  <div className="kd-row__img">{thumb ? <img src={thumb} alt="" /> : <div className="kd-row__ph"><Icon name={placeholder} /></div>}</div>
                  <div className="kd-row__text">
                    <p className="kd-row__name">{name}</p>
                    <div className="kd-row__meta"><StatusBadge status={status} />{meta ? <span>{meta}</span> : null}</div>
                  </div>
                  <Icon name="chevron" size={18} className="kd-row__chev" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title={`No ${sectionLabel(show).toLowerCase()} yet`}
          body={SAMPLES[show] ? 'Add your first one, or start from samples you can edit or delete. Everything stays a draft until you publish it.' : 'Add your first one. It stays a draft until you publish it.'}
          action={(
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="primary" size="s" icon="plus" onClick={add}>Add</Button>
              {SAMPLES[show] ? <Button variant="secondary" size="s" onClick={addSamples}>Add sample entries</Button> : null}
            </div>
          )} />
      )}
    </section>
  );
}

function AccountTab() {
  const { dispatch, repo } = useStore();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="kd-panel kd-span">
      <div className="kd-panel__h"><h2>Account</h2></div>
      <p className="kd-panel__sub">One login per group. Visitors never see these settings.</p>
      <div className="kd-form" style={{ maxWidth: 520 }}>
        <p className="kd-note"><Icon name="lock" size={18} />Sign-in (Google, or username and password with a recovery email) comes with the backend. In this prototype, the dashboard is open and everything is saved in this browser only.</p>
        <div className="kd-field">
          <p className="kd-field__label">Demo data</p>
          <p className="kd-field__hint">Put back the sample group, animals and posts. Your changes in this browser will be lost.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {confirm ? (
              <>
                <Button variant="danger" icon="undo" onClick={() => { dispatch({ type: 'state/replace', state: repo.reset() }); setConfirm(false); toast('Demo data restored.'); }}>Yes, reset everything</Button>
                <Button variant="secondary" onClick={() => setConfirm(false)}>Keep my changes</Button>
              </>
            ) : <Button variant="secondary" icon="undo" onClick={() => setConfirm(true)}>Reset demo data</Button>}
          </div>
        </div>
      </div>
    </section>
  );
}
