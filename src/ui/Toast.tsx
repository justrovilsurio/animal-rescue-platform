import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

interface ToastOptions { actionLabel?: string; onAction?: () => void; tone?: 'ok' | 'error'; duration?: number }
interface ToastState extends ToastOptions { open: boolean; message: string; key: number }
type Show = (message: string, opts?: ToastOptions) => void;

const ToastCtx = createContext<Show>(() => {});
export const useToast = () => useContext(ToastCtx);

/**
 * One toast at a time, replaced rather than stacked. The timer pauses while
 * the pointer or focus is on it, so an Undo is never snatched away.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<ToastState>({ open: false, message: '', key: 0 });
  const timer = useRef<number>();
  const [paused, setPaused] = useState(false);

  const show = useCallback<Show>((message, opts = {}) => {
    setT((prev) => ({ ...opts, open: true, message, key: prev.key + 1 }));
  }, []);

  useEffect(() => {
    if (!t.open || paused) return;
    timer.current = window.setTimeout(() => setT((p) => ({ ...p, open: false })), t.duration ?? (t.actionLabel ? 6000 : 3500));
    return () => window.clearTimeout(timer.current);
  }, [t.open, t.key, paused, t.duration, t.actionLabel]);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div
        className="kd-toast kd-toast--fixed"
        data-open={t.open ? 'true' : 'false'}
        role={t.tone === 'error' ? 'alert' : 'status'}
        aria-live={t.tone === 'error' ? 'assertive' : 'polite'}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      >
        <Icon name={t.tone === 'error' ? 'alert' : 'check'} size={18} strokeWidth={2.25} />
        <span>{t.message}</span>
        {t.actionLabel && t.open ? (
          <button type="button" onClick={() => { t.onAction?.(); setT((p) => ({ ...p, open: false })); }}>{t.actionLabel}</button>
        ) : null}
      </div>
    </ToastCtx.Provider>
  );
}
