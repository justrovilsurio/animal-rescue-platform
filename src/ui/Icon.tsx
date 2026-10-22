const PATHS: Record<string, string> = {
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
  chat: 'M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  share: 'M12 4v11 M7.5 8.5 12 4l4.5 4.5 M5 13v6h14v-6',
  close: 'M6 6l12 12 M18 6 6 18',
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 6l6 6-6 6',
  down: 'M6 9l6 6 6-6',
  up: 'M6 15l6-6 6 6',
  pin: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  calendar: 'M5 6h14v14H5z M5 10h14 M9 3v4 M15 3v4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14 M5 12h14',
  image: 'M4 5h16v14H4z M4 16l5-5 4 4 2.5-2.5L20 17 M15.5 9.5a1 1 0 1 0 0-.01',
  paw: 'M8 10.5a1.8 2.2 0 1 0 0-.01 M16 10.5a1.8 2.2 0 1 0 0-.01 M5 14a1.6 1.9 0 1 0 0-.01 M19 14a1.6 1.9 0 1 0 0-.01 M12 13.5c-2.6 0-4.5 2.6-4.5 4.4 0 1.3 1 2.1 2.3 2.1.9 0 1.4-.4 2.2-.4s1.3.4 2.2.4c1.3 0 2.3-.8 2.3-2.1 0-1.8-1.9-4.4-4.5-4.4z',
  home: 'M4 11l8-7 8 7 M6 9.5V20h12V9.5',
  layout: 'M4 4h16v16H4z M4 9h16 M10 9v11',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 4.5a3.5 3.5 0 0 1 0 6.5 M18 14.5c1.8.8 3 2.7 3 5.5',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-1.7 1l-.3 2h-4l-.3-2a7 7 0 0 1-1.7-1l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-2l-1.6-1.2 2-3.4 1.9.7a7 7 0 0 1 1.7-1l.3-2h4l.3 2a7 7 0 0 1 1.7 1l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 2z',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h10',
  gift: 'M4 9h16v4H4z M6 13v7h12v-7 M12 9v11 M12 9S9.5 4 7.5 5.5 9 9 12 9zm0 0s2.5-5 4.5-3.5S15 9 12 9z',
  alert: 'M12 8v5 M12 16.5v.01 M12 3.5l9.5 16.5h-19z',
  copy: 'M9 9h11v11H9z M5 15V4h11',
  filter: 'M4 6h16 M7 12h10 M10 18h4',
  trash: 'M5 7h14 M10 7V4h4v3 M7 7l1 13h8l1-13',
  undo: 'M9 14L4 9l5-5 M4 9h10a6 6 0 0 1 0 12h-3',
  star: 'M12 4l2.4 5 5.6.6-4.2 3.8 1.2 5.6L12 16.3 7 19l1.2-5.6L4 9.6 9.6 9z',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, strokeWidth = 1.75, label, className }: { name: string; size?: number; strokeWidth?: number; label?: string; className?: string }) {
  return (
    <svg
      className={['kd-icon', className].filter(Boolean).join(' ')} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label}
    >
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}
