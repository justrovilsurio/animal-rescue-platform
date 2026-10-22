import { useId, useState } from 'react';
import type { Photo } from '../domain/types';
import { fileToPhoto } from '../lib/images';
import { Icon } from './Icon';

interface Props {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  max?: number;
  label?: string;
  error?: string | null;
  /** Single-image mode (logo, banner, QR): replace instead of append. */
  single?: boolean;
}

/**
 * Photo picker. The first photo is the cover. The real <input type="file">
 * sits inside the "Add photo" tile's label, so it is keyboard and screen
 * reader accessible without any custom key handling.
 */
export function PhotoInput({ photos, onChange, max = 9, label = 'Add photo', error, single }: Props) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const full = !single && photos.length >= max;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setProblem(null);
    const room = single ? 1 : max - photos.length;
    const picked = Array.from(files).slice(0, room);
    const added: Photo[] = [];
    for (const f of picked) {
      try { added.push(await fileToPhoto(f, single ? 1600 : 1400)); }
      catch (e) { setProblem((e as Error).message); }
    }
    if (files.length > room && !single) setProblem(`Only ${max} photos fit. The first ${room} were added.`);
    setBusy(false);
    if (added.length) onChange(single ? added : [...photos, ...added]);
  }

  const move = (i: number) => onChange([photos[i], ...photos.filter((_, j) => j !== i)]);
  const remove = (i: number) => onChange(photos.filter((_, j) => j !== i));
  const message = problem ?? error;

  return (
    <div className="kd-field">
      <div className={single ? 'kd-photos kd-photos--single' : 'kd-photos'}>
        {photos.map((p, i) => (
          <figure className="kd-photos__item" key={p.id}>
            <img src={p.src} alt={!single && i === 0 ? 'Cover photo' : `Photo ${i + 1}`} />
            {!single && i === 0 ? <span className="kd-photos__tag">Cover</span> : null}
            <div className="kd-photos__acts">
              {!single && i > 0 ? (
                <button type="button" className="kd-iconbtn kd-iconbtn--s" onClick={() => move(i)} aria-label={`Make photo ${i + 1} the cover`}><Icon name="star" size={16} /></button>
              ) : null}
              <button type="button" className="kd-iconbtn kd-iconbtn--s" onClick={() => remove(i)} aria-label={single ? 'Remove image' : `Remove photo ${i + 1}`}><Icon name="close" size={16} /></button>
            </div>
          </figure>
        ))}
        {!full && (!single || photos.length === 0) ? (
          <label className="kd-photos__add" htmlFor={id} aria-busy={busy || undefined}>
            {busy ? <span className="kd-btn__spin" aria-hidden="true" /> : <Icon name="plus" size={22} />}
            <span>{busy ? 'Adding…' : label}</span>
            <input id={id} className="kd-sr" type="file" accept="image/*" multiple={!single}
              onChange={(e) => { void onFiles(e.target.files); e.target.value = ''; }} aria-invalid={message ? true : undefined} />
          </label>
        ) : null}
      </div>
      {message ? <p className="kd-field__error" role="alert"><Icon name="alert" size={18} />{message}</p> : null}
    </div>
  );
}
