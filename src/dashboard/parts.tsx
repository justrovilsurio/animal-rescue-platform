import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { AgeInput, EntryStatus, GroupTheme } from '../domain/types';
import { AGE_BANDS, COMMON_SPECIES, ageBandOf } from '../domain/animals';
import { Button, ButtonLink } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { ChoiceGroup, TextField } from '../ui/Field';
import { Icon } from '../ui/Icon';

/* ---------- Publish bar ---------- */
const MESSAGE: Record<EntryStatus, string> = {
  draft: 'Saved as a draft. Visitors can’t see it yet.',
  pending: 'Your edits are saved. Visitors still see the published version until you publish this update.',
  live: 'Published. Visitors see exactly what’s here.',
};

export function PublishBar({ status, message, onPublish, onDiscard, onDelete, onUnpublish, previewTo, viewTo }: {
  status: EntryStatus; message?: string | null;
  onPublish: () => void; onDiscard: () => void; onDelete: () => void; onUnpublish: () => void;
  previewTo?: string; viewTo?: string;
}) {
  return (
    <div className={['kd-pbar', status === 'pending' && 'kd-pbar--pending', status === 'draft' && 'kd-pbar--draft'].filter(Boolean).join(' ')} role="region" aria-label="Publishing">
      <div className="kd-pbar__state">
        <div><StatusBadge status={status} /></div>
        <p className="kd-pbar__msg" aria-live="polite">{message ?? MESSAGE[status]}</p>
      </div>
      <div className="kd-pbar__acts">
        {status === 'draft' ? <Button variant="danger" size="s" icon="trash" onClick={onDelete}>Delete draft</Button> : null}
        {status === 'pending' ? <Button variant="danger" size="s" onClick={onDiscard}>Discard edits</Button> : null}
        {status === 'live' ? <Button variant="ghost" size="s" onClick={onUnpublish}>Unpublish</Button> : null}
        {status !== 'live' && previewTo ? <ButtonLink variant="secondary" size="s" icon="eye" to={previewTo}>Preview</ButtonLink> : null}
        {status === 'live'
          ? (viewTo ? <ButtonLink variant="secondary" size="s" icon="eye" to={viewTo}>View on page</ButtonLink> : null)
          : <Button variant="primary" size="s" onClick={onPublish}>{status === 'pending' ? 'Publish update' : 'Publish'}</Button>}
      </div>
    </div>
  );
}

/* ---------- Section visibility switch ---------- */
export function SectionToggle({ id, position, label, checked, onChange, publishedCount, draftCount, listTo }: {
  id: string; position: number; label: string; checked: boolean; onChange: (v: boolean) => void; publishedCount: number; draftCount: number;
  /** Where this section's entries are edited, so an empty section is one click from its first entry. */
  listTo: string;
}) {
  const empty = checked && publishedCount === 0;
  const labelId = `tg-${id}`;
  return (
    <div className="kd-toggle">
      <span className="kd-toggle__pos" aria-hidden="true">{position}</span>
      <div className="kd-toggle__text">
        <p className="kd-toggle__label" id={labelId}><Link className="kd-toggle__link" to={listTo}>{label}</Link></p>
        <p className="kd-toggle__desc">
          {empty ? <span className="kd-toggle__warn">Shown, but nothing is published yet, so visitors won’t see it. <Link to={listTo}>{draftCount ? 'Finish a draft' : 'Add one'}</Link></span>
            : checked ? `${publishedCount} published${draftCount ? ` · ${draftCount} in draft` : ''}` : 'Hidden from visitors'}
        </p>
      </div>
      <button type="button" role="switch" className="kd-switch" aria-checked={checked} aria-labelledby={labelId} onClick={() => onChange(!checked)} />
    </div>
  );
}

/* ---------- Theme picker ---------- */
const THEMES: { id: GroupTheme; name: string }[] = [{ id: 'moss', name: 'Lime' }, { id: 'harbor', name: 'Periwinkle' }, { id: 'cocoa', name: 'Iris' }, { id: 'slate', name: 'Navy' }];
export function ThemePicker({ value, onChange }: { value: GroupTheme; onChange: (t: GroupTheme) => void }) {
  return (
    <ChoiceGroup legend="Page colour" hint="Each colour is checked for readable text in light and dark mode.">
      <div className="kd-themes" role="radiogroup" aria-label="Page colour">
        {THEMES.map((t) => (
          <button key={t.id} type="button" role="radio" className="kd-theme" aria-checked={value === t.id} onClick={() => onChange(t.id)}>
            <span className="kd-theme__sw" style={{ background: `var(--theme-${t.id})`, color: `var(--theme-${t.id}-on)` }}>{value === t.id ? <Icon name="check" size={20} strokeWidth={2.5} /> : null}</span>
            {t.name}
          </button>
        ))}
      </div>
    </ChoiceGroup>
  );
}

/* ---------- Species ---------- */
export function SpeciesPicker({ value, onChange }: { value: string; onChange: (species: string) => void }) {
  const isCommon = COMMON_SPECIES.includes(value);
  const otherRef = useRef<HTMLInputElement>(null);
  const otherSelected = !isCommon;
  return (
    <ChoiceGroup legend="Species">
      <div className="kd-chips" role="radiogroup" aria-label="Species">
        {COMMON_SPECIES.map((s) => (
          <button key={s} type="button" role="radio" className="kd-chip" aria-checked={value === s} onClick={() => onChange(s)}>{s}</button>
        ))}
        <button type="button" role="radio" className="kd-chip" aria-checked={otherSelected}
          onClick={() => { if (!otherSelected) onChange(''); setTimeout(() => otherRef.current?.focus(), 0); }}>Other</button>
      </div>
      {otherSelected ? (
        <TextField ref={otherRef} label="Which animal?" value={value} placeholder="e.g. Guinea pig, Goat" onChange={(e) => onChange(e.target.value)} />
      ) : null}
    </ChoiceGroup>
  );
}

/* ---------- Age ---------- */
const BAND_LABEL = Object.fromEntries([...AGE_BANDS.map((b) => [b.value, b.label]), ['unknown', 'Age not known']]);

export function AgePicker({ value, onChange }: { value: AgeInput; onChange: (a: AgeInput) => void }) {
  const band = ageBandOf(value);
  return (
    <ChoiceGroup legend="Age" optional>
      <div className="kd-seg" role="radiogroup" aria-label="How to give the age">
        <button type="button" role="radio" aria-checked={value.mode === 'approx'} onClick={() => onChange({ mode: 'approx', text: value.mode === 'approx' ? value.text : '' })}>Approximate</button>
        <button type="button" role="radio" aria-checked={value.mode === 'range'} onClick={() => onChange({ mode: 'range', band: band !== 'unknown' ? band : '1-3y' })}>Range</button>
        <button type="button" role="radio" aria-checked={value.mode === 'unknown'} onClick={() => onChange({ mode: 'unknown' })}>Not sure</button>
      </div>
      {value.mode === 'approx' ? (
        <TextField label="Approximate age" value={value.text} placeholder="About 2 years"
          onChange={(e) => onChange({ mode: 'approx', text: e.target.value })}
          hint={value.text.trim()
            ? (band === 'unknown' ? 'We can’t read this as an age, so it will show under “Age not known” in the filter. Try “8 months” or “about 3 years”.' : `Shows up in the “${BAND_LABEL[band]}” filter.`)
            : 'Write it the way you’d say it: “about 2 years”, “8 weeks”, “senior”.'} />
      ) : null}
      {value.mode === 'range' ? (
        <div className="kd-chips" role="radiogroup" aria-label="Age range">
          {AGE_BANDS.map((b) => (
            <button key={b.value} type="button" role="radio" className="kd-chip" aria-checked={value.band === b.value} onClick={() => onChange({ mode: 'range', band: b.value })}>{b.label}</button>
          ))}
        </div>
      ) : null}
      {value.mode === 'unknown' ? <p className="kd-field__hint">Visitors will see “Not known”. You can add it later.</p> : null}
    </ChoiceGroup>
  );
}
