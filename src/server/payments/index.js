import 'server-only';

/**
 * Payment provider registry. Every provider implements:
 *   id, label, online (bool), isEnabled(storeSettings), initiate(order) -> { status, redirectUrl? }
 * Online providers (JazzCash, Easypaisa, Safepay, cards…) can be added here later. They must only
 * mark an order "paid" after verifying the provider's server-to-server callback signature —
 * never from a browser redirect alone.
 */
const providers = {
  cod: {
    id: 'cod',
    label: 'Cash on Delivery',
    online: false,
    isEnabled: (store) => store?.payment?.codEnabled !== false,
    // COD is collected by the courier; payment stays "pending" until an admin marks it paid.
    initiate: async () => ({ status: 'pending' }),
  },
};

export function getPaymentProvider(id) {
  return providers[id] || null;
}

export function listEnabledPaymentMethods(store) {
  return Object.values(providers)
    .filter((p) => p.isEnabled(store))
    .map(({ id, label, online }) => ({ id, label, online }));
}
