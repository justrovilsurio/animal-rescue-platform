import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../state/store';
import { entryStatus, validateForPublish, workingCopy, type FieldErrors } from '../domain/publishing';
import { sectionLabel } from '../domain/sections';
import type {
  AdoptionContent, Collection, ContentByCollection, DonationContent, Entry, EventContent, GuideContent, RescueContent, StoryContent, VolunteerContent, Sex,
} from '../domain/types';
import { nowIso } from '../lib/ids';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { SelectField, TextArea, TextField, ChoiceGroup } from '../ui/Field';
import { PhotoInput } from '../ui/PhotoInput';
import { EmptyState } from '../ui/EmptyState';
import { AgePicker, PublishBar, SpeciesPicker } from './parts';
import { AnimalCard } from '../public/components';
import { PublicCtx } from '../public/context';

const ANIMAL = new Set<Collection>(['rescues', 'adopt']);

/**
 * One editor for every kind of entry. Every change is saved straight into the
 * entry's draft (autosave), so nothing is lost by navigating away. Publishing
 * is the only step that changes what visitors see.
 */
export function EditorRoute() {
  const { collection, id } = useParams<{ collection: Collection; id: string }>();
  const { state } = useStore();
  const navigate = useNavigate();
  const list = collection && collection in state.entries ? (state.entries[collection] as Entry<ContentByCollection[Collection]>[]) : null;
  const entry = list?.find((e) => e.id === id);
  if (!collection || !entry) {
    return <EmptyState title="That entry doesn't exist" body="It may have been deleted." action={<Button variant="secondary" size="s" onClick={() => navigate('/dashboard/animals')}>Back to your lists</Button>} />;
  }
  return <Editor key={entry.id} collection={collection} entry={entry} />;
}

function Editor({ collection, entry }: { collection: Collection; entry: Entry<ContentByCollection[Collection]> }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const content = workingCopy(entry);
  const status = entryStatus(entry);
  const [errors, setErrors] = useState<FieldErrors>({});
  const errorRef = useRef<HTMLDivElement>(null);
  const isAnimal = ANIMAL.has(collection);
  const listPath = isAnimal ? `/dashboard/animals?show=${collection}` : `/dashboard/community?show=${collection}`;

  function edit(patch: Partial<ContentByCollection[Collection]>) {
    dispatch({ type: 'entry/edit', collection, id: entry.id, patch });
    if (Object.keys(errors).length) setErrors((prev) => { const n = { ...prev }; Object.keys(patch).forEach((k) => delete n[k]); return n; });
  }

  function publish() {
    const errs = validateForPublish(collection, content);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => {
        const first = errorRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        first?.focus();
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }
    const wasPending = status === 'pending';
    dispatch({ type: 'entry/publish', collection, id: entry.id, now: nowIso() });
    const name = (content as { name?: string; title?: string }).name || (content as { title?: string }).title || 'It';
    toast(!state.page.publishedAt
      ? `${name} is published. Visitors will see it once your page is public.`
      : wasPending ? `${name}'s update is live.` : `${name} is now on your page.`);
  }

  function discard() {
    const snapshot = entry;
    dispatch({ type: 'entry/discard', collection, id: entry.id });
    setErrors({});
    toast('Edits discarded. The published version is unchanged.', {
      actionLabel: 'Undo', onAction: () => dispatch({ type: 'entry/restore', collection, entry: snapshot, index: indexOf(snapshot.id) }),
    });
  }
  function indexOf(id: string) { return (state.entries[collection] as { id: string }[]).findIndex((e) => e.id === id); }

  function remove() {
    const snapshot = entry, index = indexOf(entry.id);
    dispatch({ type: 'entry/delete', collection, id: entry.id });
    navigate(listPath);
    toast('Draft deleted.', { actionLabel: 'Undo', onAction: () => dispatch({ type: 'entry/restore', collection, entry: snapshot, index }) });
  }
  function unpublish() {
    dispatch({ type: 'entry/unpublish', collection, id: entry.id });
    toast('Taken off your page. It’s kept here as a draft.', {
      actionLabel: 'Undo', onAction: () => dispatch({ type: 'entry/publish', collection, id: entry.id, now: nowIso() }),
    });
  }

  const title = (content as { name?: string }).name ?? (content as { title?: string }).title ?? '';
  const pagePath = isAnimal ? `/${collection}/${entry.id}` : '';
  const errorCount = Object.keys(errors).length;

  return (
    <div className="kd-form">
      <div className="kd-edit__head">
        <Button variant="ghost" size="s" icon="back" onClick={() => navigate(listPath)}>{sectionLabel(collection)}</Button>
        <div style={{ marginLeft: 'auto' }}><StatusBadge status={status} /></div>
      </div>
      <h1 className="kd-edit__title">{title.trim() || (isAnimal ? 'New animal' : 'Untitled')}</h1>

      <div className="kd-edit" ref={errorRef}>
        <div className="kd-form">
          {collection === 'rescues' || collection === 'adopt'
            ? <AnimalFields collection={collection} c={content as RescueContent & AdoptionContent} edit={edit} errors={errors} />
            : <CommunityFields collection={collection} c={content} edit={edit} errors={errors} />}
        </div>
        {isAnimal ? (
          <aside className="kd-edit__aside">
            <section className="kd-panel">
              <div className="kd-panel__h"><h2>On your page</h2></div>
              <p className="kd-panel__sub">How the card will look.</p>
              <div style={{ maxWidth: 220, pointerEvents: 'none' }} aria-hidden="true">
                <PublicCtx.Provider value={{ preview: false, base: '/dashboard/preview' }}>
                  <AnimalCard id={entry.id} kind={collection as 'rescues' | 'adopt'} content={content as AdoptionContent} />
                </PublicCtx.Provider>
              </div>
            </section>
          </aside>
        ) : null}
      </div>

      <div className="kd-edit__pbar">
        <PublishBar status={status}
          message={errorCount ? `Fix ${errorCount === 1 ? 'one thing' : `${errorCount} things`} before publishing. Everything else can wait.` : null}
          onPublish={publish} onDiscard={discard} onDelete={remove} onUnpublish={unpublish}
          previewTo={isAnimal ? `/dashboard/preview${pagePath}` : '/dashboard/preview'}
          viewTo={isAnimal ? `/dashboard/preview${pagePath}` : '/dashboard/preview'} />
      </div>
    </div>
  );
}

type Edit = (patch: Partial<ContentByCollection[Collection]>) => void;

function AnimalFields({ collection, c, edit, errors }: { collection: 'rescues' | 'adopt'; c: RescueContent & AdoptionContent; edit: Edit; errors: FieldErrors }) {
  const isAdopt = collection === 'adopt';
  return (
    <>
      <section className="kd-panel" aria-labelledby="ph-photos">
        <div className="kd-panel__h"><h2 id="ph-photos">Photos</h2></div>
        <p className="kd-panel__sub">The first photo is the cover on the gallery card. Add up to 8 more for the detail view. Tap the star to make a photo the cover.</p>
        <PhotoInput photos={c.photos} onChange={(photos) => edit({ photos })} error={errors.photos} />
      </section>
      <section className="kd-panel" aria-labelledby="ph-about">
        <div className="kd-panel__h"><h2 id="ph-about">About {c.name.trim() || 'this animal'}</h2></div>
        <div className="kd-form__grid" style={{ marginTop: 12 }}>
          <TextField label="Name" value={c.name} onChange={(e) => edit({ name: e.target.value })} error={errors.name} autoComplete="off" />
          <TextField label="Public location" value={c.location} onChange={(e) => edit({ location: e.target.value })} hint="City or general area only. Never a street address." />
          <div className="kd-span"><SpeciesPicker value={c.species} onChange={(species) => edit({ species })} /></div>
          {isAdopt ? <div className="kd-span"><AgePicker value={c.age} onChange={(age) => edit({ age })} /></div> : null}
          {isAdopt ? (
            <SelectField label="Sex" optional value={c.sex ?? ''} onChange={(e) => edit({ sex: (e.target.value || null) as Sex })}>
              <option value="">Not sure</option><option>Female</option><option>Male</option>
            </SelectField>
          ) : null}
          <TextField label="Breed" optional value={c.breed} placeholder="e.g. Aspin, Puspin, mixed" onChange={(e) => edit({ breed: e.target.value })} />
          {!isAdopt ? <TextField label="Date rescued" optional value={c.rescuedOn} placeholder="14 Feb 2026" onChange={(e) => edit({ rescuedOn: e.target.value })} /> : null}
        </div>
      </section>
      <section className="kd-panel" aria-labelledby="ph-more">
        <div className="kd-panel__h"><h2 id="ph-more">{isAdopt ? 'Personality and health' : 'Rescue story'}</h2></div>
        <div className="kd-form" style={{ marginTop: 12 }}>
          {isAdopt ? (
            <>
              <TextArea label="Personality" optional rows={4} value={c.personality} onChange={(e) => edit({ personality: e.target.value })} hint="How they are with people, kids and other animals." />
              <TextArea label="Health and vaccinations" optional rows={3} value={c.health} onChange={(e) => edit({ health: e.target.value })} />
            </>
          ) : (
            <TextArea label="Story" rows={8} value={c.story} onChange={(e) => edit({ story: e.target.value })} hint="The first sentence is shown in bold. Leave a blank line between paragraphs." />
          )}
        </div>
      </section>
    </>
  );
}

function CommunityFields({ collection, c, edit, errors }: { collection: Collection; c: ContentByCollection[Collection]; edit: Edit; errors: FieldErrors }) {
  const common = (bodyLabel: string, hint?: string) => (
    <>
      <TextField label="Title" value={(c as { title: string }).title} onChange={(e) => edit({ title: e.target.value } as never)} error={errors.title} />
      <TextArea label={bodyLabel} rows={5} value={(c as { body: string }).body} onChange={(e) => edit({ body: e.target.value } as never)} hint={hint} />
    </>
  );
  let extra: React.ReactNode = null;
  if (collection === 'stories') {
    const s = c as StoryContent;
    extra = (
      <>
        <TextField label="Adopted" optional value={s.adoptedOn} placeholder="Sep 2026" onChange={(e) => edit({ adoptedOn: e.target.value } as never)} />
        <ChoiceGroup legend="Photos"><PhotoInput photos={s.photos} onChange={(photos) => edit({ photos } as never)} max={4} /></ChoiceGroup>
      </>
    );
  } else if (collection === 'events') {
    const e = c as EventContent;
    extra = (
      <div className="kd-form__grid">
        <TextField label="Date" type="date" value={e.date} onChange={(ev) => edit({ date: ev.target.value } as never)} />
        <TextField label="Time" optional value={e.time} placeholder="9:00 am – 1:00 pm" onChange={(ev) => edit({ time: ev.target.value } as never)} />
        <TextField className="kd-span" label="Where" value={e.where} placeholder="Venue, city" onChange={(ev) => edit({ where: ev.target.value } as never)} />
      </div>
    );
  } else if (collection === 'volunteer') {
    const v = c as VolunteerContent;
    extra = <TextField label="Time commitment" optional value={v.commitment} placeholder="2 hrs / week" onChange={(e) => edit({ commitment: e.target.value } as never)} />;
  } else if (collection === 'donation') {
    const d = c as DonationContent;
    const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, '')) || 0);
    extra = (
      <>
        <div className="kd-form__grid">
          <TextField label="Goal (₱)" inputMode="numeric" value={d.goal ? String(d.goal) : ''} placeholder="18000" onChange={(e) => edit({ goal: num(e.target.value) } as never)} optional />
          <TextField label="Raised so far (₱)" inputMode="numeric" value={d.raised ? String(d.raised) : ''} placeholder="0" onChange={(e) => edit({ raised: num(e.target.value) } as never)} optional hint="Update this by hand. Kindred never handles money." />
        </div>
        <TextField label="Account name" value={d.account} placeholder="GCash · Your group name" onChange={(e) => edit({ account: e.target.value } as never)} />
        <ChoiceGroup legend="QR code" hint="A screenshot of your GCash or bank QR works.">
          <PhotoInput single photos={d.qr ? [d.qr] : []} onChange={(p) => edit({ qr: p[0] ?? null } as never)} label="Upload QR" />
        </ChoiceGroup>
      </>
    );
  } else if (collection === 'guides') {
    const g = c as GuideContent;
    extra = <TextField label="Reading time" optional value={g.readTime} placeholder="5 min read" onChange={(e) => edit({ readTime: e.target.value } as never)} />;
  }
  const bodyLabel = { stories: 'Story', events: 'Details', volunteer: 'What they’ll do', donation: 'What the money is for', guides: 'Guide' }[collection as 'stories'] ?? 'Details';
  return (
    <section className="kd-panel">
      <div className="kd-form">{common(bodyLabel)}{extra}</div>
    </section>
  );
}
