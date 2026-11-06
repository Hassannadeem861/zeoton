'use client';

import Image from 'next/image';
import { Banknote, QrCode, Upload } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { formatPKR } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const ICONS = { cod: Banknote, bank_qr: QrCode };
const NOTES = {
  cod: (codNote) => codNote || 'Pay in cash when your order is delivered.',
  bank_qr: () => 'Pay now by scanning our Meezan Bank QR, then upload the payment screenshot.',
};

export default function PaymentOptions({ methods = [], value, onChange, codNote, total, shippingPending, file, onFile }) {
  if (!methods.length) {
    return <p className="text-sm text-warning">No payment method is available right now. Please contact us to place your order.</p>;
  }
  const { bankQr } = siteConfig;

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Payment method">
      {methods.map((m) => {
        const Icon = ICONS[m.id] || Banknote;
        const active = value === m.id;
        return (
          <label key={m.id} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition', active ? 'border-blue-500/60 bg-blue-500/10' : 'border-line hover:border-mist-500')}>
            <input type="radio" name="paymentMethod" value={m.id} checked={active} onChange={() => onChange(m.id)} className="mt-1 h-4 w-4 accent-blue-500" />
            <Icon className="mt-0.5 h-5 w-5 text-blue-300" aria-hidden />
            <span>
              <span className="block font-medium text-mist-50">{m.label}</span>
              <span className="mt-0.5 block text-sm text-mist-300">{NOTES[m.id]?.(codNote)}</span>
            </span>
          </label>
        );
      })}

      {value === 'bank_qr' && (
        <div className="rounded-xl border border-line bg-ink-800/60 p-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Image src={bankQr.image} alt={`${bankQr.bank} QR code for ${bankQr.accountTitle}`} width={200} height={200} className="rounded-lg bg-white p-2" />
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-mist-300">
              <li>Open your banking app and scan this QR ({bankQr.bank} — {bankQr.accountTitle}).</li>
              <li>
                Pay <strong className="text-mist-50">{formatPKR(total)}</strong>
                {shippingPending && ' (shipping, if any, is confirmed separately)'}.
              </li>
              <li>Take a screenshot of the successful payment and upload it below.</li>
            </ol>
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-3 text-sm text-mist-300 hover:border-blue-500">
            <Upload className="h-4 w-4" aria-hidden />
            {file ? `Selected: ${file.name}` : 'Upload payment screenshot (JPG or PNG, max 4 MB)'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] || null)} />
          </label>
          <p className="mt-2 text-xs text-mist-500">Your order is confirmed after we verify the payment.</p>
        </div>
      )}
    </div>
  );
}
