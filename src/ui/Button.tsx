import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

type Variant = 'primary' | 'group' | 'accent' | 'lime' | 'ink' | 'secondary' | 'ghost' | 'danger';
interface Common { variant?: Variant; size?: 'm' | 's'; icon?: string; iconEnd?: string; block?: boolean; loading?: boolean; children?: ReactNode }

export const btnClass = (variant: Variant = 'secondary', size: 'm' | 's' = 'm', block?: boolean, extra?: string) =>
  ['kd-btn', `kd-btn--${variant}`, size === 's' && 'kd-btn--s', block && 'kd-btn--block', extra].filter(Boolean).join(' ');

function Inner({ icon, iconEnd, size, loading, children }: Common) {
  return (
    <>
      {loading ? <span className="kd-btn__spin" aria-hidden="true" /> : icon ? <Icon name={icon} size={size === 's' ? 18 : 20} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={18} /> : null}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, Common & ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { variant, size, icon, iconEnd, block, loading, children, className, type = 'button', disabled, ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} className={btnClass(variant, size, block, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      <Inner {...{ icon, iconEnd, size, loading, children }} />
    </button>
  );
});

/** External links (mailto:, Facebook) */
export function ButtonA({ variant, size, icon, iconEnd, block, children, className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={btnClass(variant, size, block, className)} {...rest}><Inner {...{ icon, iconEnd, size, children }} /></a>;
}

/** In-app navigation */
export function ButtonLink({ variant, size, icon, iconEnd, block, children, className, to, state }: Common & { to: string; className?: string; state?: unknown }) {
  return <Link to={to} state={state} className={btnClass(variant, size, block, className)}><Inner {...{ icon, iconEnd, size, children }} /></Link>;
}
