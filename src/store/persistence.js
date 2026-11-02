// Tiny localStorage persistence for cart and shopper lists (replaces redux-persist).
const KEY = 'zeoton:v1';

export function loadPersisted() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function subscribePersist(store) {
  let last;
  let timer;
  return store.subscribe(() => {
    const { cart, lists, ui } = store.getState();
    if (!ui.hydrated) return;
    if (last && last.cart === cart && last.lists === lists) return;
    last = { cart, lists };
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ cart, lists }));
      } catch {
        // Storage full or blocked (private mode): keep working in memory.
      }
    }, 150);
  });
}
