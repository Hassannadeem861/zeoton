import { createSlice } from '@reduxjs/toolkit';

// Small ID lists owned by the shopper: wishlist, compare and recently viewed.
export const COMPARE_MAX = 4;
const RECENT_MAX = 12;

const listsSlice = createSlice({
  name: 'lists',
  initialState: { wishlist: [], compare: [], recent: [] },
  reducers: {
    hydrateLists: (state, { payload }) => {
      const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
      state.wishlist = arr(payload?.wishlist).slice(0, 200);
      state.compare = arr(payload?.compare).slice(0, COMPARE_MAX);
      state.recent = arr(payload?.recent).slice(0, RECENT_MAX);
    },
    toggleWishlist: (state, { payload: id }) => {
      state.wishlist = state.wishlist.includes(id) ? state.wishlist.filter((x) => x !== id) : [id, ...state.wishlist];
    },
    setWishlist: (state, { payload }) => {
      state.wishlist = payload;
    },
    toggleCompare: (state, { payload: id }) => {
      if (state.compare.includes(id)) state.compare = state.compare.filter((x) => x !== id);
      else if (state.compare.length < COMPARE_MAX) state.compare.push(id);
    },
    clearCompare: (state) => {
      state.compare = [];
    },
    addRecentlyViewed: (state, { payload: id }) => {
      state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, RECENT_MAX);
    },
  },
});

export const { hydrateLists, toggleWishlist, setWishlist, toggleCompare, clearCompare, addRecentlyViewed } =
  listsSlice.actions;
export default listsSlice.reducer;
