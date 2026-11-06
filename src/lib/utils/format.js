const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

export function formatPKR(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `Rs ${pkr.format(Math.round(Number(amount)))}`;
}

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-PK', { timeZone: 'Asia/Karachi', ...opts }).format(new Date(value));
}

export function formatDateTime(value) {
  return formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatPhone(phone) {
  if (!phone || phone.length !== 11) return phone || '';
  return `${phone.slice(0, 4)} ${phone.slice(4)}`;
}

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pending confirmation',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_LABELS = { cod: 'Cash on Delivery', bank_qr: 'Meezan Bank QR' };
