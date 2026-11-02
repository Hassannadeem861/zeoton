// End-to-end smoke test against a running server (default http://localhost:3100).
// Run it against a TEST database (see README "Testing"); it creates and removes its own data.
//   BASE_URL=http://localhost:3100 node --env-file=.env.local scripts/smoke-test.mjs
import sharp from 'sharp';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://localhost:3100';
const ADMIN = { email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD };
const run = Date.now().toString(36);
const results = [];
const cleanup = { products: [], coupons: [] };

async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✔ ${name}`);
  } catch (err) {
    results.push({ name, ok: false, err });
    console.log(`  ✘ ${name}\n      ${err.message}`);
  }
}

function client() {
  let cookie = '';
  return async function request(path, { method = 'GET', body, headers = {}, form } = {}) {
    const res = await fetch(BASE + path, {
      method,
      redirect: 'manual',
      headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers },
      body: form || (body ? JSON.stringify(body) : undefined),
    });
    const set = res.headers.getSetCookie?.() || [];
    for (const c of set) {
      const [pair] = c.split(';');
      if (pair.startsWith('zt_session=')) cookie = pair.endsWith('=') || /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(c) ? '' : pair;
    }
    const type = res.headers.get('content-type') || '';
    const data = type.includes('json') ? await res.json() : await res.text();
    return { status: res.status, data, headers: res.headers };
  };
}

const guest = client();
const admin = client();
const customer = client();
const customer2 = client();

console.log(`\nZEOTON smoke test → ${BASE}\n`);

// ---------- Public pages & SEO ----------
console.log('Public pages & SEO');
for (const path of ['/', '/products', '/categories', '/category/gaming-mice', '/faq', '/about', '/contact', '/shipping-policy', '/returns-policy', '/privacy-policy', '/terms', '/track-order', '/cart', '/checkout', '/wishlist', '/compare', '/login', '/register']) {
  await step(`GET ${path} → 200`, async () => assert.equal((await guest(path)).status, 200));
}
await step('Unknown URL → 404 page', async () => {
  const r = await guest('/this-page-does-not-exist');
  assert.equal(r.status, 404);
  assert.match(r.data, /not in our inventory/);
});
await step('Home: title, canonical, OG, JSON-LD (OnlineStore + WebSite)', async () => {
  const { data } = await guest('/');
  assert.match(data, /<title>[^<]*Gaming Accessories in Pakistan[^<]*<\/title>/);
  assert.match(data, /rel="canonical" href="https?:\/\/[^"/]+\/?"/);
  assert.match(data, /property="og:image"/);
  assert.match(data, /"@type":"OnlineStore"/);
  assert.match(data, /"@type":"WebSite"/);
  assert.equal((data.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1');
});
await step('Cart & checkout are noindex', async () => {
  for (const p of ['/cart', '/checkout']) assert.match((await guest(p)).data, /<meta name="robots" content="noindex/);
});
await step('Empty category is noindex (no thin pages)', async () => {
  assert.match((await guest('/category/gaming-chairs')).data, /<meta name="robots" content="noindex/);
});
await step('robots.txt blocks private areas and lists sitemap', async () => {
  const { data } = await guest('/robots.txt');
  assert.match(data, /Disallow: \/admin/);
  assert.match(data, /Disallow: \/checkout/);
  assert.match(data, /Sitemap: /);
});
await step('sitemap.xml is valid and excludes private pages', async () => {
  const { data } = await guest('/sitemap.xml');
  assert.match(data, /<urlset/);
  assert.doesNotMatch(data, /\/admin|\/checkout|\/cart/);
});
await step('Security headers present', async () => {
  const { headers } = await guest('/');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-powered-by'), null);
});

// ---------- Auth & authorization ----------
console.log('\nAuthentication & authorization');
await step('Guest /api/auth/me → user null', async () => {
  const r = await guest('/api/auth/me');
  assert.equal(r.status, 200);
  assert.equal(r.data.user, null);
});
await step('Guest → admin API is 401', async () => assert.equal((await guest('/api/admin/dashboard')).status, 401));
await step('Guest → /admin redirects to /admin/login', async () => {
  const r = await guest('/admin');
  assert.ok([307, 308].includes(r.status));
  assert.match(r.headers.get('location'), /\/admin\/login/);
});
await step('Guest → /account redirects to /login', async () => {
  const r = await guest('/account/orders');
  assert.ok([307, 308].includes(r.status));
  assert.match(r.headers.get('location'), /\/login\?next=/);
});
await step('Register validation errors are field-level (400)', async () => {
  const r = await customer('/api/auth/register', { method: 'POST', body: { name: 'A', email: 'bad', password: 'short' } });
  assert.equal(r.status, 400);
  assert.ok(r.data.errors.email && r.data.errors.password && r.data.errors.name);
});
const custEmail = `smoke-${run}@example.com`;
await step('Customer registers (HttpOnly session cookie)', async () => {
  const r = await customer('/api/auth/register', { method: 'POST', body: { name: 'Smoke Customer', email: custEmail, phone: '0300 1234567', password: 'Password123' } });
  assert.equal(r.status, 201);
  const cookieHeader = r.headers.getSetCookie().find((c) => c.startsWith('zt_session='));
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /SameSite=lax/i);
});
await step('Duplicate registration → 409', async () => {
  const r = await guest('/api/auth/register', { method: 'POST', body: { name: 'Smoke Customer', email: custEmail, password: 'Password123' } });
  assert.equal(r.status, 409);
});
await step('Customer → admin API is 403', async () => assert.equal((await customer('/api/admin/products')).status, 403));
await step('Customer cannot sign in through admin login', async () => {
  const r = await guest('/api/admin/auth/login', { method: 'POST', body: { email: custEmail, password: 'Password123' } });
  assert.equal(r.status, 401);
});
await step('Cross-origin POST is rejected (CSRF origin check)', async () => {
  const r = await customer('/api/account/profile', { method: 'PATCH', body: { name: 'Hacker' }, headers: { origin: 'https://evil.example' } });
  assert.equal(r.status, 403);
});
await step('Wrong admin password → generic 401', async () => {
  const r = await guest('/api/admin/auth/login', { method: 'POST', body: { email: ADMIN.email, password: 'wrong-password-1' } });
  assert.equal(r.status, 401);
  assert.equal(r.data.message, 'Invalid email or password.');
});
await step('Admin signs in', async () => {
  const r = await admin('/api/admin/auth/login', { method: 'POST', body: ADMIN });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.user.role, 'admin');
});
await step('Admin panel page renders for admin', async () => {
  const r = await admin('/admin');
  assert.equal(r.status, 200);
  assert.match(r.data, /noindex/);
});

// ---------- Catalog CRUD ----------
console.log('\nProduct & category management');
let categories = [];
let simple;
let variantProduct;
await step('Admin lists seeded categories', async () => {
  const r = await admin('/api/admin/categories');
  categories = r.data.items;
  assert.ok(categories.find((c) => c.slug === 'gaming-mice'));
});
const mice = () => categories.find((c) => c.slug === 'gaming-mice');
await step('Invalid product → 400 with field errors', async () => {
  const r = await admin('/api/admin/products', { method: 'POST', body: { name: '', sku: '', price: -5, category: 'x' } });
  assert.equal(r.status, 400);
  assert.ok(r.data.errors.name && r.data.errors.price && r.data.errors.category);
});
await step('Sale price must be below price', async () => {
  const r = await admin('/api/admin/products', { method: 'POST', body: { name: 'Bad sale', sku: `BAD-${run}`, price: 1000, salePrice: 2000, category: mice()._id } });
  assert.equal(r.status, 400);
  assert.ok(r.data.errors.salePrice);
});
await step('Create simple product', async () => {
  const r = await admin('/api/admin/products', {
    method: 'POST',
    body: { name: `Smoke Test Mouse ${run}`, sku: `SMK-${run}`, category: mice()._id, brand: 'SmokeBrand', price: 5000, salePrice: 4500, stock: 3, specs: [{ label: 'Connection', value: 'Wired' }], shortDescription: 'Test product for automated checks.' },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  simple = r.data.product;
  cleanup.products.push(simple._id);
  assert.equal(simple.sellPrice, 4500);
  assert.equal(simple.slug, `smoke-test-mouse-${run}`);
});
await step('Duplicate SKU → 409', async () => {
  const r = await admin('/api/admin/products', { method: 'POST', body: { name: `Other ${run}`, sku: `SMK-${run}`, category: mice()._id, price: 100 } });
  assert.equal(r.status, 409);
});
await step('Create variant product', async () => {
  const r = await admin('/api/admin/products', {
    method: 'POST',
    body: {
      name: `Smoke Test Keyboard ${run}`, sku: `SMKV-${run}`, category: mice()._id, price: 9000,
      variants: [{ label: 'Red switch', sku: `SMKV-R-${run}`, stock: 2 }, { label: 'Blue switch', sku: `SMKV-B-${run}`, price: 9500, stock: 0 }],
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  variantProduct = r.data.product;
  cleanup.products.push(variantProduct._id);
  assert.equal(variantProduct.sellPrice, 9000);
});
await step('Update product (PUT)', async () => {
  const body = { ...simple, shortDescription: 'Updated description.' };
  ['_id', '__v', 'createdAt', 'updatedAt', 'sellPrice', 'soldCount'].forEach((k) => delete body[k]);
  body.specs = body.specs.map(({ label, value }) => ({ label, value }));
  const r = await admin(`/api/admin/products/${simple._id}`, { method: 'PUT', body });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.product.shortDescription, 'Updated description.');
});
await step('Product page renders with Product JSON-LD (PKR price, availability)', async () => {
  const r = await guest(`/product/${simple.slug}`);
  assert.equal(r.status, 200);
  assert.match(r.data, /"@type":"Product"/);
  assert.match(r.data, /"priceCurrency":"PKR"/);
  assert.match(r.data, /"price":4500/);
  assert.match(r.data, /InStock/);
  assert.doesNotMatch(r.data, /aggregateRating/);
});
await step('Listing filters: price + brand + search', async () => {
  const r = await guest(`/products?brand=SmokeBrand&max=4600`);
  assert.match(r.data, new RegExp(`Smoke Test Mouse ${run}`));
  const s = await guest(`/search?q=${encodeURIComponent(`Smoke Test Mouse ${run}`)}`);
  assert.match(s.data, new RegExp(`Smoke Test Mouse ${run}`));
});
await step('Search suggestions API', async () => {
  const r = await guest(`/api/products/suggest?q=${encodeURIComponent(`Smoke Test Mouse ${run}`)}`);
  assert.equal(r.data.products[0]?.slug, simple.slug);
});
await step('Inventory: optimistic stock endpoint', async () => {
  const r = await admin(`/api/admin/products/${simple._id}/stock`, { method: 'PATCH', body: { stock: 3 } });
  assert.equal(r.status, 200);
  assert.equal(r.data.stock, 3);
});

// ---------- Cart, coupon, checkout ----------
console.log('\nCart, coupons & checkout');
let coupon;
await step('Admin creates coupon', async () => {
  const r = await admin('/api/admin/coupons', { method: 'POST', body: { code: `SMOKE${run}`.toUpperCase().slice(0, 30), type: 'percent', value: 10, minOrder: 0, maxUses: 5 } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  coupon = r.data.coupon;
  cleanup.coupons.push(coupon._id);
});
await step('Quote uses server prices, coupon and pending shipping', async () => {
  const r = await guest('/api/checkout/quote', { method: 'POST', body: { items: [{ productId: simple._id, quantity: 2 }], couponCode: coupon.code } });
  assert.equal(r.status, 200);
  assert.equal(r.data.subtotal, 9000);
  assert.equal(r.data.discount, 900);
  assert.equal(r.data.shipping.pending, true);
  assert.equal(r.data.total, 8100);
});
await step('Quote flags insufficient stock and missing variant', async () => {
  const r = await guest('/api/checkout/quote', { method: 'POST', body: { items: [{ productId: simple._id, quantity: 9 }, { productId: variantProduct._id, quantity: 1 }] } });
  assert.equal(r.data.hasIssues, true);
  assert.equal(r.data.lines[0].issue, 'insufficient_stock');
  assert.equal(r.data.lines[1].issue, 'variant_required');
});
const address = { fullName: 'Smoke Tester', phone: '+92 345 1234567', province: 'Sindh', city: 'Karachi', addressLine: 'House 1, Street 2, Block 3', postalCode: '75500' };
await step('Checkout validation: bad phone/province → 400', async () => {
  const r = await guest('/api/orders', { method: 'POST', body: { shippingAddress: { ...address, phone: '12345', province: 'Nowhere' }, items: [{ productId: simple._id, quantity: 1 }], paymentMethod: 'cod' } });
  assert.equal(r.status, 400);
  assert.ok(r.data.errors['shippingAddress.phone'] && r.data.errors['shippingAddress.province']);
});
await step('Unsupported payment method rejected', async () => {
  const r = await guest('/api/orders', { method: 'POST', body: { shippingAddress: address, items: [{ productId: simple._id, quantity: 1 }], paymentMethod: 'card' } });
  assert.equal(r.status, 400);
});
let guestOrder;
await step('Guest places COD order (stock reserved, coupon used)', async () => {
  const r = await guest('/api/orders', { method: 'POST', body: { shippingAddress: address, items: [{ productId: simple._id, quantity: 2 }], couponCode: coupon.code, paymentMethod: 'cod' } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  guestOrder = r.data;
  assert.match(guestOrder.orderNumber, /^ZT-\d{6}$/);
  assert.equal(guestOrder.total, 8100);
  assert.equal(guestOrder.payment.status, 'pending');
  const p = await admin(`/api/admin/products/${simple._id}`);
  assert.equal(p.data.product.stock, 1);
});
await step('Ordering more than stock → 409, nothing reserved', async () => {
  const r = await guest('/api/orders', { method: 'POST', body: { shippingAddress: address, items: [{ productId: simple._id, quantity: 2 }], paymentMethod: 'cod' } });
  assert.equal(r.status, 409);
  const p = await admin(`/api/admin/products/${simple._id}`);
  assert.equal(p.data.product.stock, 1);
});
await step('Variant order reserves variant stock', async () => {
  const red = variantProduct.variants.find((v) => v.label === 'Red switch');
  const r = await customer('/api/orders', { method: 'POST', body: { shippingAddress: address, items: [{ productId: variantProduct._id, variantId: red._id, quantity: 2 }], paymentMethod: 'cod', saveAddress: true } });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const p = await admin(`/api/admin/products/${variantProduct._id}`);
  assert.equal(p.data.product.variants.find((v) => v.label === 'Red switch').stock, 0);
});
await step('Tracking: wrong phone → 404, right phone → order (no full address)', async () => {
  const bad = await guest('/api/orders/track', { method: 'POST', body: { orderNumber: guestOrder.orderNumber, phone: '03000000000' } });
  assert.equal(bad.status, 404);
  const ok = await guest('/api/orders/track', { method: 'POST', body: { orderNumber: guestOrder.orderNumber, phone: '0345 1234567' } });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.order.status, 'pending');
  assert.equal(ok.data.order.shippingAddress.addressLine, undefined);
});
let customerOrderNumber;
await step('Customer sees own orders; saved address stored', async () => {
  const r = await customer('/api/orders');
  assert.equal(r.status, 200);
  assert.equal(r.data.total, 1);
  customerOrderNumber = r.data.items[0].orderNumber;
  const prof = await customer('/api/account/profile');
  assert.equal(prof.data.profile.addresses.length, 1);
  assert.equal(prof.data.profile.addresses[0].phone, '03451234567');
});
await step("Another customer cannot read someone else's order", async () => {
  await customer2('/api/auth/register', { method: 'POST', body: { name: 'Second Customer', email: `smoke2-${run}@example.com`, password: 'Password123' } });
  const r = await customer2(`/api/orders/${customerOrderNumber}`);
  assert.equal(r.status, 404);
});
await step('Wishlist sync (merge) for signed-in customer', async () => {
  const r = await customer('/api/account/wishlist', { method: 'PUT', body: { ids: [simple._id], merge: true } });
  assert.deepEqual(r.data.ids, [simple._id]);
});

// ---------- Admin order workflow ----------
console.log('\nAdmin order workflow');
let adminOrderId;
await step('Admin finds order and sets shipping fee (total recalculated)', async () => {
  const list = await admin(`/api/admin/orders?q=${guestOrder.orderNumber}`);
  adminOrderId = list.data.items[0]._id;
  const r = await admin(`/api/admin/orders/${adminOrderId}`, { method: 'PATCH', body: { shippingFee: 250 } });
  assert.equal(r.status, 200);
  assert.equal(r.data.order.total, 8350);
});
await step('Invalid status jump (pending → delivered) → 400', async () => {
  const r = await admin(`/api/admin/orders/${adminOrderId}`, { method: 'PATCH', body: { status: 'delivered' } });
  assert.equal(r.status, 400);
});
await step('pending → confirmed → shipped → delivered; soldCount updated; COD marked paid', async () => {
  for (const status of ['confirmed', 'shipped', 'delivered']) {
    const r = await admin(`/api/admin/orders/${adminOrderId}`, { method: 'PATCH', body: { status } });
    assert.equal(r.status, 200, `${status}: ${JSON.stringify(r.data)}`);
  }
  const paid = await admin(`/api/admin/orders/${adminOrderId}`, { method: 'PATCH', body: { paymentStatus: 'paid' } });
  assert.equal(paid.data.order.payment.status, 'paid');
  const p = await admin(`/api/admin/products/${simple._id}`);
  assert.equal(p.data.product.soldCount, 2);
});
await step('Cancelling an order restores stock', async () => {
  const list = await admin(`/api/admin/orders?q=${customerOrderNumber}`);
  const r = await admin(`/api/admin/orders/${list.data.items[0]._id}`, { method: 'PATCH', body: { status: 'cancelled', note: 'smoke test' } });
  assert.equal(r.status, 200);
  const p = await admin(`/api/admin/products/${variantProduct._id}`);
  assert.equal(p.data.product.variants.find((v) => v.label === 'Red switch').stock, 2);
});
await step('Dashboard reflects real data', async () => {
  const r = await admin('/api/admin/dashboard');
  assert.equal(r.status, 200);
  assert.ok(r.data.revenue.collected >= 8350);
  assert.ok(r.data.orders.total >= 2);
  assert.ok(r.data.customers >= 2);
});
await step('Best sellers appear only after a delivery', async () => {
  const r = await guest('/products?sort=popular');
  assert.match(r.data, new RegExp(`Smoke Test Mouse ${run}`));
});
await step('Customers list + disable account signs the customer out', async () => {
  const list = await admin(`/api/admin/customers?q=smoke2-${run}`);
  const id = list.data.items[0]._id;
  await admin(`/api/admin/customers/${id}`, { method: 'PATCH', body: { isActive: false } });
  const me = await customer2('/api/auth/me');
  assert.equal(me.data.user, null);
});
await step('Settings: shipping flat fee applies to new quotes', async () => {
  const s = await admin('/api/admin/settings');
  const store = { ...s.data.settings.store, shipping: { ...s.data.settings.store.shipping, mode: 'flat', flatFee: 300, freeShippingThreshold: 20000 } };
  const r = await admin('/api/admin/settings/store', { method: 'PUT', body: store });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const q = await guest('/api/checkout/quote', { method: 'POST', body: { items: [{ productId: simple._id, quantity: 1 }] } });
  assert.equal(q.data.shipping.fee, 300);
  assert.equal(q.data.total, 4800);
  // restore "not decided"
  await admin('/api/admin/settings/store', { method: 'PUT', body: { ...store, shipping: { ...store.shipping, mode: 'pending', flatFee: null, freeShippingThreshold: null } } });
});
await step('Contact form stores message (honeypot respected)', async () => {
  const r = await guest('/api/contact', { method: 'POST', body: { name: 'Smoke', email: 'smoke@example.com', message: 'Automated smoke test message.' } });
  assert.equal(r.status, 201);
  const m = await admin('/api/admin/messages?status=new');
  assert.ok(m.data.items.some((x) => x.message === 'Automated smoke test message.'));
});

// ---------- Image pipeline (Cloudinary) ----------
console.log('\nImage optimisation & Cloudinary');
const uploaded = [];
async function upload(buffer, name, type, extra = {}) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type }), name);
  Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  return admin('/api/admin/uploads', { method: 'POST', form });
}
await step('Photo is converted to WebP ≤ 250 KB at original dimensions', async () => {
  // Smooth gradient photo-like image, 2400×1600 JPEG.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600"><defs><radialGradient id="g"><stop offset="0" stop-color="#0a6ffd"/><stop offset="1" stop-color="#070a12"/></radialGradient></defs><rect width="2400" height="1600" fill="url(#g)"/><circle cx="1200" cy="800" r="500" fill="#f5f7fb" opacity="0.6"/></svg>`;
  const jpg = await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer();
  const r = await upload(jpg, 'photo.jpg', 'image/jpeg');
  assert.equal(r.status, 201, JSON.stringify(r.data));
  const img = r.data.image;
  uploaded.push(img);
  assert.equal(img.format, 'webp');
  assert.equal(img.width, 2400);
  assert.equal(img.height, 1600);
  assert.ok(img.bytes <= 250 * 1024, `bytes ${img.bytes}`);
  assert.ok(img.url.startsWith('https://res.cloudinary.com/'));
});
let noisy;
await step('Unreachable target → 422 warning, nothing uploaded', async () => {
  const raw = Buffer.alloc(2000 * 2000 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = (Math.random() * 256) | 0;
  noisy = await sharp(raw, { raw: { width: 2000, height: 2000, channels: 3 } }).jpeg({ quality: 70 }).toBuffer();
  const r = await upload(noisy, 'noise.jpg', 'image/jpeg');
  assert.equal(r.status, 422, JSON.stringify(r.data).slice(0, 200));
  assert.equal(r.data.code, 'IMAGE_TARGET_UNREACHABLE');
});
await step('Admin confirms → oversize upload allowed and flagged', async () => {
  const r = await upload(noisy, 'noise.jpg', 'image/jpeg', { allowOversize: '1' });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  uploaded.push(r.data.image);
  assert.equal(r.data.image.withinTarget, false);
  assert.equal(r.data.image.width, 2000);
});
await step('Non-image and tiny images are rejected', async () => {
  assert.equal((await upload(Buffer.from('hello'), 'a.txt', 'text/plain')).status, 400);
  const tiny = await sharp({ create: { width: 100, height: 100, channels: 3, background: '#000' } }).png().toBuffer();
  assert.equal((await upload(tiny, 'tiny.png', 'image/png')).status, 400);
});
await step('Customer cannot upload', async () => {
  const form = new FormData();
  form.append('file', new Blob([Buffer.from('x')], { type: 'image/png' }), 'x.png');
  assert.equal((await customer('/api/admin/uploads', { method: 'POST', form })).status, 403);
});
await step('Attach images to product; storefront serves them via Cloudinary', async () => {
  const p = (await admin(`/api/admin/products/${simple._id}`)).data.product;
  const body = { ...p, images: uploaded.map((i) => ({ url: i.url, publicId: i.publicId, width: i.width, height: i.height, format: i.format, bytes: i.bytes, alt: 'Smoke test image' })) };
  ['_id', '__v', 'createdAt', 'updatedAt', 'sellPrice', 'soldCount'].forEach((k) => delete body[k]);
  body.specs = body.specs.map(({ label, value }) => ({ label, value }));
  const r = await admin(`/api/admin/products/${simple._id}`, { method: 'PUT', body });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const page = await guest(`/product/${simple.slug}`);
  assert.match(page.data, /res\.cloudinary\.com/);
});

// ---------- Demo catalog (only when demo products exist) ----------
const demoLookup = await guest(`/api/products/suggest?q=${encodeURIComponent('Vantix Phantom')}`);
const demo = demoLookup.data?.products?.find((p) => p.isDemo);
if (demo) {
  console.log('\nDemo catalog');
  await step('Demo product page: DEMO label, noindex, no Product JSON-LD', async () => {
    const r = await guest(`/product/${demo.slug}`);
    assert.equal(r.status, 200);
    assert.match(r.data, /Demo product/i);
    assert.match(r.data, /Demo price/);
    assert.match(r.data, /<meta name="robots" content="noindex/);
    assert.doesNotMatch(r.data, /"@type":"Product"/);
  });
  await step('Demo product cards show the DEMO label on listings', async () => {
    const r = await guest('/category/gaming-mice');
    assert.match(r.data, /Demo product/i);
    assert.match(r.data, /<meta name="robots" content="noindex/);
  });
  await step('Home and /products are noindex while demo products are listed', async () => {
    assert.match((await guest('/')).data, /<meta name="robots" content="noindex/);
    assert.match((await guest('/products')).data, /<meta name="robots" content="noindex/);
  });
  await step('Sitemap excludes demo products and demo categories', async () => {
    const { data } = await guest('/sitemap.xml');
    assert.doesNotMatch(data, new RegExp(demo.slug));
    assert.doesNotMatch(data, /gaming-monitors|wireless-gaming-mice/);
  });
  await step('Demo order is flagged and excluded from dashboard figures', async () => {
    const before = (await admin('/api/admin/dashboard')).data;
    const lookup = await guest('/api/products/lookup', { method: 'POST', body: { ids: [demo.id] } });
    const variantId = lookup.data.items[0].variants[0]?.id || null;
    const q = await guest('/api/checkout/quote', { method: 'POST', body: { items: [{ productId: demo.id, variantId, quantity: 1 }] } });
    assert.equal(q.data.hasDemoItems, true);
    const o = await guest('/api/orders', { method: 'POST', body: { shippingAddress: address, items: [{ productId: demo.id, variantId, quantity: 1 }], paymentMethod: 'cod' } });
    assert.equal(o.status, 201, JSON.stringify(o.data));
    const list = await admin(`/api/admin/orders?q=${o.data.orderNumber}`);
    assert.equal(list.data.items[0].isDemo, true);
    const after = (await admin('/api/admin/dashboard')).data;
    assert.equal(after.orders.total, before.orders.total);
    assert.equal(after.demoOrders, before.demoOrders + 1);
    // cancel to return the demo stock
    await admin(`/api/admin/orders/${list.data.items[0]._id}`, { method: 'PATCH', body: { status: 'cancelled', note: 'smoke test' } });
  });
} else {
  console.log('\nDemo catalog: no demo products found — demo checks skipped');
}

// ---------- Rate limiting ----------
console.log('\nRate limiting');
await step('Repeated failed logins → 429', async () => {
  let last;
  for (let i = 0; i < 12; i++) last = await guest('/api/auth/login', { method: 'POST', body: { email: `nobody-${run}@example.com`, password: 'Wrong12345' } });
  assert.equal(last.status, 429);
});

// ---------- Cleanup ----------
console.log('\nCleanup');
await step('Delete test products (and their Cloudinary images) and coupon', async () => {
  for (const id of cleanup.products) assert.equal((await admin(`/api/admin/products/${id}`, { method: 'DELETE' })).status, 200);
  for (const id of cleanup.coupons) assert.equal((await admin(`/api/admin/coupons/${id}`, { method: 'DELETE' })).status, 200);
});
await step('Logout clears session', async () => {
  await customer('/api/auth/logout', { method: 'POST' });
  assert.equal((await customer('/api/auth/me')).data.user, null);
});

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log('Failed:', failed.map((f) => f.name).join('; '));
  process.exit(1);
}
