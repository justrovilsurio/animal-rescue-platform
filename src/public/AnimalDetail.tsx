import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { AdoptionContent, RescueContent } from '../domain/types';
import { ageLabel } from '../domain/animals';
import { useStore, useVisibleEntries } from '../state/store';
import { Icon } from '../ui/Icon';
import { Img } from '../ui/Img';
import { ButtonA } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { usePublic } from './context';
import { Monogram, mailto, messengerUrl } from './components';

/**
 * The detail overlay is a ROUTE, not component state:
 *   /second-wind/adopt/mango
 * so it can be shared, bookmarked, and closed with the browser's Back button.
 * When opened from a card, the card passed `background` in location.state and
 * the page underneath keeps rendering; opened from a shared link, the gallery
 * renders underneath instead.
 */
export function AnimalDetailRoute({ kind }: { kind: 'rescues' | 'adopt' }) {
  const { id } = useParams();
  const { preview, base } = usePublic();
  const entries = useVisibleEntries(kind, preview);
  const found = entries.find((e) => e.id === id);
  const navigate = useNavigate();
  const location = useLocation();
  const hasBackground = Boolean((location.state as { background?: unknown } | null)?.background);

  const close = useCallback(() => {
    if (hasBackground) navigate(-1);
    else navigate(`${base}/${kind}`, { replace: true });
  }, [hasBackground, navigate, base, kind]);

  if (!found) return <MissingAnimal onClose={close} />;
  return <AnimalDetail kind={kind} content={found.content} onClose={close} />;
}

function MissingAnimal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay label="Animal not found" onClose={onClose}>
      <div className="kd-ov__content" style={{ paddingTop: 72 }}>
        <h2 className="kd-ov__name" id="ov-title">This animal isn't listed any more</h2>
        <p className="kd-ov__p">They may have found a home, or the group took the listing down. The rest of the animals are still here.</p>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose, label, labelledBy, actions }: { children: React.ReactNode; onClose: () => void; label?: string; labelledBy?: string; actions?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<Element | null>(null);

  useEffect(() => {
    returnTo.current = document.activeElement;
    const raf = requestAnimationFrame(() => { setOpen(true); closeRef.current?.focus({ preventScroll: true }); });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
      (returnTo.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, []);

  const dismiss = useCallback(() => { setOpen(false); window.setTimeout(onClose, 200); }, [onClose]);

  // Escape works wherever focus is, not only inside the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dismiss]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  return (
    <div className="kd-ov" data-open={open} onKeyDown={onKeyDown}>
      <div className="kd-ov__scrim" onClick={dismiss} aria-hidden="true" />
      <div className="kd-ov__center" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
        <div className="kd-ov__panel" role="dialog" aria-modal="true" aria-label={label} aria-labelledby={labelledBy ?? (label ? undefined : 'ov-title')} ref={panelRef}>
          <div className="kd-ov__bar">
            <button type="button" className="kd-iconbtn" ref={closeRef} onClick={dismiss} aria-label="Close"><Icon name="close" /></button>
            {actions}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function AnimalDetail({ kind, content, onClose }: { kind: 'rescues' | 'adopt'; content: RescueContent | AdoptionContent; onClose: () => void }) {
  const { state } = useStore();
  const page = state.page;
  const toast = useToast();
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const photos = content.photos;
  const name = content.name || 'Untitled';

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: `${name} · ${page.name}`, url }); return; }
      await navigator.clipboard.writeText(url);
      toast(`Link to ${name} copied`);
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') toast("Couldn't copy the link. Copy it from the address bar.", { tone: 'error' });
    }
  }

  function onScroll() {
    const t = trackRef.current;
    if (!t) return;
    const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
    if (i !== idx) setIdx(i);
  }
  function goTo(i: number) {
    const t = trackRef.current;
    if (t) t.scrollTo({ left: i * t.clientWidth, behavior: 'smooth' });
    setIdx(i);
  }

  const isAdopt = kind === 'adopt';
  const a = content as AdoptionContent;
  const r = content as RescueContent;
  const fact = (label: string, v: string | null | undefined) => (
    <div><dt>{label}</dt><dd className={v ? undefined : 'kd-unknown'}>{v || 'Not known'}</dd></div>
  );

  return (
    <Overlay onClose={onClose} labelledBy="ov-title"
      actions={<button type="button" className="kd-iconbtn" onClick={share} aria-label={`Share ${name}`}><Icon name="share" /></button>}>
      <div className="kd-ov__layout">
        <div className="kd-ov__photos">
          <div className="kd-ov__track" ref={trackRef} onScroll={onScroll} tabIndex={photos.length > 1 ? 0 : -1} aria-label={photos.length > 1 ? `Photos of ${name}. Scroll sideways for more.` : undefined}>
            {photos.map((p, i) => (
              <div className="kd-ov__slide" key={p.id}><Img src={p.src} alt={i === 0 ? name : `${name}, photo ${i + 1}`} /></div>
            ))}
          </div>
          {photos.length > 1 ? <span className="kd-ov__count" aria-hidden="true">{idx + 1} / {photos.length}</span> : null}
          {photos.length > 1 ? (
            <div className="kd-ov__thumbs">
              {photos.map((p, i) => (
                <button key={p.id} type="button" aria-current={i === idx} aria-label={`Show photo ${i + 1}`} onClick={() => goTo(i)}><Img src={p.src} alt="" /></button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="kd-ov__right">
          <div className="kd-ov__content">
            <div>
              <p className="kd-ov__kicker"><Icon name={isAdopt ? 'paw' : 'heart'} size={16} />{isAdopt ? 'For adoption' : 'Rescue story'}</p>
              <h2 className="kd-ov__name" id="ov-title">{name}</h2>
              {isAdopt
                ? <p className="kd-ov__lede">{[a.species, a.breed].filter(Boolean).join(' · ')}</p>
                : <p className="kd-ov__lede kd-muted">{[r.rescuedOn && `Rescued ${r.rescuedOn}`, r.location].filter(Boolean).join(' · ')}</p>}
            </div>
            {isAdopt ? (
              <>
                <dl className="kd-facts">{fact('Age', ageLabel(a.age))}{fact('Sex', a.sex)}{fact('Breed', a.breed)}{fact('Location', a.location)}</dl>
                {a.personality ? <div><h3 className="kd-ov__h">Personality</h3><p className="kd-ov__p">{a.personality}</p></div> : null}
                {a.health ? <div><h3 className="kd-ov__h">Health and vaccinations</h3><p className="kd-ov__p">{a.health}</p></div> : null}
                <div className="kd-ov__group">
                  <Monogram page={page} className="kd-topbar__mono" />
                  <p><strong>{page.name}</strong>Ask about {name} by email or on Facebook. A volunteer usually replies within a day.</p>
                </div>
              </>
            ) : (
              <div className="kd-ov__story">
                {(r.story || '').split(/\n\s*\n/).filter(Boolean).map((para, i) => <p className="kd-ov__p" key={i}>{para}</p>)}
              </div>
            )}
          </div>
          {isAdopt && (page.email || page.facebook) ? (
            <div className="kd-ov__contact">
              {page.email ? <ButtonA variant="accent" icon="mail" href={mailto(page.email, `About ${name}`)}>Email about {name}</ButtonA> : null}
              {page.facebook ? <ButtonA variant="secondary" icon="chat" href={messengerUrl(page.facebook)} target="_blank" rel="noopener noreferrer" aria-label={`Message ${page.name} on Facebook`}>Facebook</ButtonA> : null}
            </div>
          ) : null}
        </div>
      </div>
    </Overlay>
  );
}
