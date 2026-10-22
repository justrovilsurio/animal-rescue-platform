import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function EmptyState({ title, body, icon = 'paw', action }: { title: string; body?: string; icon?: string; action?: ReactNode }) {
  return (
    <div className="kd-empty">
      <div className="kd-empty__art" aria-hidden="true"><Icon name={icon} size={26} /></div>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  );
}
