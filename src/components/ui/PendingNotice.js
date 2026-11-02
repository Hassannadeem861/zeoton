import Link from 'next/link';
import { Info } from 'lucide-react';

export default function PendingNotice({ children }) {
  return (
    <div className="my-6 flex gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-mist-200">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" aria-hidden />
      <div>
        {children}{' '}
        <Link href="/contact" className="text-blue-300 underline underline-offset-2">Contact us</Link> if you have questions.
      </div>
    </div>
  );
}
