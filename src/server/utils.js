import 'server-only';
import { revalidatePath } from 'next/cache';

// Converts lean Mongo documents (ObjectId, Date) to plain JSON for Client Components.
export const plain = (value) => (value == null ? value : JSON.parse(JSON.stringify(value)));

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Storefront pages are statically cached (ISR); call after admin changes to catalog/content.
export function revalidateStorefront() {
  try {
    revalidatePath('/', 'layout');
  } catch (err) {
    console.warn('[cache] revalidate skipped:', err?.message);
  }
}
