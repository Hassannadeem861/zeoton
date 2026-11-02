import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(status, message, { code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (msg, extra) => new HttpError(400, msg, extra);
export const notFound = (msg = 'Not found') => new HttpError(404, msg);
export const conflict = (msg) => new HttpError(409, msg);

function zodFieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function errorResponse(err) {
  if (err instanceof HttpError) {
    return NextResponse.json(
      { message: err.message, code: err.code, ...(err.details ? { details: err.details } : {}) },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { message: 'Please check the highlighted fields.', code: 'VALIDATION_ERROR', errors: zodFieldErrors(err) },
      { status: 400 },
    );
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'value';
    const label = field.split('.').pop();
    return NextResponse.json(
      { message: `This ${label} is already in use.`, code: 'DUPLICATE', errors: { [field]: `This ${label} is already in use.` } },
      { status: 409 },
    );
  }
  if (err?.name === 'CastError') {
    return NextResponse.json({ message: 'Invalid identifier.', code: 'INVALID_ID' }, { status: 400 });
  }
  console.error('[api] Unhandled error:', err);
  return NextResponse.json({ message: 'Something went wrong on our side. Please try again.' }, { status: 500 });
}
