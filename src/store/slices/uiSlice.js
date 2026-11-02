import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, hydrated: false },
  reducers: {
    openCart: (state) => {
      state.cartOpen = true;
    },
    closeCart: (state) => {
      state.cartOpen = false;
    },
    markHydrated: (state) => {
      state.hydrated = true;
    },
  },
});

export const { openCart, closeCart, markHydrated } = uiSlice.actions;
export default uiSlice.reducer;
