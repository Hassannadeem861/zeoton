import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import cartReducer from './slices/cartSlice';
import listsReducer from './slices/listsSlice';
import uiReducer from './slices/uiSlice';

// A new store per browser session (created once in StoreProvider), as recommended for Next.js.
export function makeStore() {
  return configureStore({
    reducer: {
      cart: cartReducer,
      lists: listsReducer,
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });
}
