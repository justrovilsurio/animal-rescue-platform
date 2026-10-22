import type { ReactNode } from 'react';
import { Icon } from './Icon';

export type BadgeStatus = 'live' | 'draft' | 'pending' | 'private' | 'hidden';
const LABEL: Record<BadgeStatus, string> = { live: 'Published', draft: 'Draft', pending: 'Unpublished edits', private: 'Private', hidden: 'Hidden' };

export function StatusBadge({ status, children, className }: { status: BadgeStatus; children?: ReactNode; className?: string }) {
  return (
    <span className={['kd-badge', `kd-badge--${status}`, className].filter(Boolean).join(' ')}>
      {status === 'private' || status === 'hidden'
        ? <Icon name={status === 'private' ? 'lock' : 'eye'} size={14} strokeWidth={2} />
        : <span className="kd-badge__dot" aria-hidden="true" />}
      {children ?? LABEL[status]}
    </span>
  );
}
