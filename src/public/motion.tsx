import { useEffect, useState } from 'react';

/**
 * Scroll reveals. Anything marked data-reveal gets data-shown once it scrolls
 * into view (once only); CSS decides what the reveal looks like. Runs after
 * every render of the page, so sections that appear later are picked up too.
 * Without IntersectionObserver (old browsers, tests) everything is shown at once.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown])'));
    if (!els.length) return;
    if (typeof IntersectionObserver === 'undefined') { els.forEach((el) => { el.dataset.shown = ''; }); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        (en.target as HTMLElement).dataset.shown = '';
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

const FACES = ['400 1em Anton', '400 1em Caladea', '700 1em Caladea'];
type Phase = 'wait' | 'skeleton' | 'ready';

/**
 * Hold the page until its fonts are in, so the big condensed headings never
 * flash in a fallback face. Cached fonts are ready immediately (no skeleton);
 * a first visit shows the skeleton only if loading takes longer than `grace`,
 * and never waits longer than `max`.
 */
export function useFontsReady(grace = 120, max = 2500): Phase {
  // Dev only: add ?skeleton to the URL to hold the skeleton on screen and look at it.
  const pinned = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skeleton');
  const [phase, setPhase] = useState<Phase>(() => {
    if (pinned) return 'skeleton';
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (!fonts) return 'ready';
    return FACES.every((f) => fonts.check(f)) ? 'ready' : 'wait';
  });
  useEffect(() => {
    if (phase === 'ready' || pinned) return;
    let done = false;
    const finish = () => { done = true; setPhase('ready'); };
    const toSkeleton = window.setTimeout(() => { if (!done) setPhase('skeleton'); }, grace);
    const giveUp = window.setTimeout(finish, max);
    Promise.all(FACES.map((f) => document.fonts.load(f))).then(finish, finish);
    return () => { window.clearTimeout(toSkeleton); window.clearTimeout(giveUp); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return phase;
}

/** Facebook-style skeleton of the public page: same layout, grey shimmering blocks. */
export function PageSkeleton() {
  const bar = (w: string, h: number, extra?: string) => <span className={['kd-sk', extra].filter(Boolean).join(' ')} style={{ width: w, height: h }} />;
  return (
    <div className="kd-pub kd-skel" aria-busy="true" aria-live="polite">
      <span className="kd-sr">Loading page…</span>
      <div className="kd-topbar" aria-hidden="true">
        {bar('34px', 34, 'kd-sk--round kd-sk--on')}{bar('180px', 18, 'kd-sk--on')}
        <span className="kd-skel__links">{bar('64px', 14, 'kd-sk--on')}{bar('56px', 14, 'kd-sk--on')}{bar('72px', 14, 'kd-sk--on')}{bar('52px', 14, 'kd-sk--on')}</span>
        <span className="kd-skel__end">{bar('104px', 40, 'kd-sk--pill kd-sk--on')}</span>
      </div>
      <div className="kd-hero" aria-hidden="true">
        <div className="kd-wrap kd-hero__inner">
          <div className="kd-skel__text">
            {bar('78%', 92)}{bar('92%', 92)}
            {bar('34%', 16, 'kd-skel__gap')}
            {bar('86%', 18)}{bar('80%', 18)}{bar('58%', 18)}
            <span className="kd-skel__row">{bar('168px', 50, 'kd-sk--pill')}{bar('132px', 50, 'kd-sk--pill')}</span>
          </div>
          <div className="kd-hero__art"><span className="kd-sk kd-skel__blob" /></div>
        </div>
      </div>
      <div className="kd-wrap" aria-hidden="true">
        <div className="kd-stats">{[0, 1, 2].map((i) => <span key={i} className="kd-sk kd-skel__tile" />)}</div>
      </div>
      <div className="kd-sec" aria-hidden="true">
        <div className="kd-wrap">
          {bar('320px', 52, 'kd-skel__h')}
          <div className="kd-grid kd-grid--4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="kd-skel__card">
                <span className="kd-sk kd-skel__media" />
                {bar('52%', 24)}{bar('70%', 14)}{bar('44%', 14)}
                {bar('118px', 40, 'kd-sk--pill')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
