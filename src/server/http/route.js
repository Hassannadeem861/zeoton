import 'server-only';
import { NextResponse } from 'next/server';
import { connectDB } from '@/server/db/connect';
import { getCurrentUser } from '@/server/auth/dal';
import { HttpError, errorResponse } from './errors';
import { enforceRateLimit } from './rateLimit';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// CSRF defence in depth (cookies are already SameSite=Lax): state-changing requests
// sent by a browser must come from our own origin.
function assertSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, 'Invalid request origin.');
  }
  if (originHost !== host) throw new HttpError(403, 'Invalid request origin.');
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

/**
 * Wraps a Route Handler with DB connection, origin check, rate limiting,
 * authentication/authorization, Zod validation and consistent error responses.
 *
 * @param {{ auth?: 'user'|'admin', withUser?: boolean, body?: import('zod').ZodType,
 *           query?: import('zod').ZodType, rateLimit?: { name: string, limit: number, windowSec: number },
 *           status?: number }} options
 * @param {(ctx: { request: Request, params: object, body: any, query: any, user: any }) => any} handler
 */
export function route(options, handler) {
  return async function routeHandler(request, context) {
    try {
      if (!SAFE_METHODS.has(request.method)) assertSameOrigin(request);
      await connectDB();
      if (options.rateLimit) await enforceRateLimit(request, options.rateLimit);

      let user = null;
      if (options.auth || options.withUser) {
        user = await getCurrentUser();
        if (options.auth && !user) throw new HttpError(401, 'Please sign in to continue.', { code: 'UNAUTHENTICATED' });
        if (options.auth === 'admin' && user.role !== 'admin') {
          throw new HttpError(403, 'You do not have permission to do this.', { code: 'FORBIDDEN' });
        }
      }

      const params = context?.params ? await context.params : {};
      const body = options.body ? options.body.parse(await readJson(request)) : undefined;
      const query = options.query
        ? options.query.parse(Object.fromEntries(new URL(request.url).searchParams))
        : undefined;

      const result = await handler({ request, params, body, query, user });
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true }, {
        status: options.status || 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch (err) {
      return errorResponse(err);
    }
  };
}
