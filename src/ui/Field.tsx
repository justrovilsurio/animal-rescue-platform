import { forwardRef, useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface Shell { label: ReactNode; hint?: ReactNode; error?: string | null; optional?: boolean; className?: string }

/** Wires label, hint and error to the control with ids so screen readers announce them. */
function FieldShell({ label, hint, error, optional, className, children }: Shell & { children: (ids: { id: string; describedBy?: string }) => ReactNode }) {
  const id = useId();
  const hintId = `${id}-hint`, errId = `${id}-err`;
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={['kd-field', className].filter(Boolean).join(' ')} data-invalid={error ? 'true' : 'false'}>
      <label className="kd-field__label" htmlFor={id}>
        {label}{optional ? <span className="kd-field__opt">Optional</span> : null}
      </label>
      {children({ id, describedBy })}
      {hint ? <p className="kd-field__hint" id={hintId}>{hint}</p> : null}
      {error ? <p className="kd-field__error" id={errId}><Icon name="alert" size={18} />{error}</p> : null}
    </div>
  );
}

export const TextField = forwardRef<HTMLInputElement, Shell & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, hint, error, optional, className, ...input }, ref,
) {
  return (
    <FieldShell {...{ label, hint, error, optional, className }}>
      {({ id, describedBy }) => <input ref={ref} id={input.id ?? id} className="kd-input" aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...input} />}
    </FieldShell>
  );
});

export function TextArea({ label, hint, error, optional, className, ...input }: Shell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell {...{ label, hint, error, optional, className }}>
      {({ id, describedBy }) => <textarea id={id} className="kd-textarea" aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...input} />}
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, optional, className, children, ...input }: Shell & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell {...{ label, hint, error, optional, className }}>
      {({ id, describedBy }) => (
        <div className="kd-selectwrap">
          <select id={id} className="kd-select" aria-describedby={describedBy} {...input}>{children}</select>
          <Icon name="down" size={18} />
        </div>
      )}
    </FieldShell>
  );
}

/** For groups of chips/radios: a fieldset so the legend labels the whole group. */
export function ChoiceGroup({ legend, hint, optional, children, error }: { legend: ReactNode; hint?: ReactNode; optional?: boolean; error?: string | null; children: ReactNode }) {
  return (
    <fieldset className="kd-field kd-fieldset">
      <legend className="kd-field__label">{legend}{optional ? <span className="kd-field__opt">Optional</span> : null}</legend>
      {children}
      {hint ? <p className="kd-field__hint">{hint}</p> : null}
      {error ? <p className="kd-field__error"><Icon name="alert" size={18} />{error}</p> : null}
    </fieldset>
  );
}
