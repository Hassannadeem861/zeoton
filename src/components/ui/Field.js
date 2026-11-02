import { cn } from '@/lib/utils/cn';

/** Accessible label + control + error wrapper for react-hook-form inputs. */
export default function Field({ id, label, error, hint, required, className, children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-blue-400" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-mist-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Props to spread on an input: aria-invalid/describedby wiring. */
export const fieldProps = (id, error, extraClass) => ({
  id,
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
  className: cn('field', extraClass),
});
