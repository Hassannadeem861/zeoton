// Extracts a user-facing message from RTK Query / fetch errors. Returns null for
// form-validation errors that are already shown next to fields.
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err.data?.message) return err.data.message;
  if (err.status === 'FETCH_ERROR') return 'Network error. Check your connection and try again.';
  if (err.error) return err.error;
  if (err.message) return err.message;
  return fallback;
}

// Maps server field errors ({ "shippingAddress.city": "..." }) onto react-hook-form.
export function applyServerFieldErrors(err, setError) {
  const fields = err?.data?.errors;
  if (!fields || typeof fields !== 'object') return false;
  Object.entries(fields).forEach(([name, message]) => setError(name, { type: 'server', message }));
  return Object.keys(fields).length > 0;
}
