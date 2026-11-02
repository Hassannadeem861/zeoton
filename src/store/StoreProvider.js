'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';
import { loadPersisted, subscribePersist } from './persistence';
import { hydrateCart } from './slices/cartSlice';
import { hydrateLists } from './slices/listsSlice';
import { markHydrated } from './slices/uiSlice';

export default function StoreProvider({ children }) {
  const [store] = useState(makeStore);

  // Hydrate after mount so server and first client render match.
  useEffect(() => {
    const saved = loadPersisted();
    if (saved?.cart) store.dispatch(hydrateCart(saved.cart));
    if (saved?.lists) store.dispatch(hydrateLists(saved.lists));
    store.dispatch(markHydrated());
    return subscribePersist(store);
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
