'use client';

import { Form } from 'antd';
import { useController } from 'react-hook-form';

/**
 * Binds an Ant Design control to react-hook-form + Zod.
 * render receives { value|checked, onChange, onBlur, id, status }.
 */
export function RHFItem({ control, name, label, required, extra, render, checkbox = false, className, style }) {
  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error?.message;
  const props = checkbox
    ? { checked: !!field.value, onChange: (v) => field.onChange(v?.target ? v.target.checked : v), onBlur: field.onBlur }
    : { value: field.value, onChange: (v) => field.onChange(v?.target ? v.target.value : v), onBlur: field.onBlur };
  return (
    <Form.Item
      label={label}
      required={required}
      extra={extra}
      validateStatus={error ? 'error' : undefined}
      help={error}
      htmlFor={name}
      className={className}
      style={style}
    >
      {render({ ...props, id: name, status: error ? 'error' : undefined })}
    </Form.Item>
  );
}

/** Applies { "field.path": "message" } server errors to the form. Returns true if any applied. */
export function setServerErrors(err, setError) {
  const fields = err?.data?.errors;
  if (!fields) return false;
  Object.entries(fields).forEach(([k, message]) => setError(k, { type: 'server', message }));
  return true;
}
