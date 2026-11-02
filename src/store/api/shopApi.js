import { baseApi } from './baseApi';

export const shopApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ----- Auth -----
    getMe: build.query({ query: () => '/auth/me', providesTags: ['Me'] }),
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Me', 'MyOrder', 'Profile', 'Wishlist'],
    }),
    register: build.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Me', 'MyOrder', 'Profile', 'Wishlist'],
    }),

    // ----- Catalog -----
    lookupProducts: build.query({
      query: (ids) => ({ url: '/products/lookup', method: 'POST', body: { ids } }),
      transformResponse: (r) => r.items,
      providesTags: ['Product'],
      keepUnusedDataFor: 120,
    }),
    searchSuggestions: build.query({
      query: (q) => ({ url: '/products/suggest', params: { q } }),
      keepUnusedDataFor: 60,
    }),

    // ----- Cart & checkout -----
    quoteCart: build.query({
      query: ({ items, couponCode }) => ({ url: '/checkout/quote', method: 'POST', body: { items, couponCode } }),
      providesTags: ['Product'],
      keepUnusedDataFor: 30,
    }),
    placeOrder: build.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['MyOrder', 'Product', 'Profile'],
    }),
    trackOrder: build.mutation({ query: (body) => ({ url: '/orders/track', method: 'POST', body }) }),

    // ----- Account -----
    getMyOrders: build.query({
      query: ({ page = 1 } = {}) => ({ url: '/orders', params: { page } }),
      providesTags: ['MyOrder'],
    }),
    getMyOrder: build.query({ query: (orderNumber) => `/orders/${orderNumber}`, providesTags: ['MyOrder'] }),
    getProfile: build.query({ query: () => '/account/profile', transformResponse: (r) => r.profile, providesTags: ['Profile'] }),
    updateProfile: build.mutation({
      query: (body) => ({ url: '/account/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile', 'Me'],
    }),
    changePassword: build.mutation({ query: (body) => ({ url: '/account/password', method: 'PATCH', body }) }),
    saveAddresses: build.mutation({
      query: (addresses) => ({ url: '/account/addresses', method: 'PUT', body: { addresses } }),
      invalidatesTags: ['Profile'],
    }),
    syncWishlist: build.mutation({ query: (body) => ({ url: '/account/wishlist', method: 'PUT', body }) }),

    sendContactMessage: build.mutation({ query: (body) => ({ url: '/contact', method: 'POST', body }) }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLookupProductsQuery,
  useSearchSuggestionsQuery,
  useQuoteCartQuery,
  usePlaceOrderMutation,
  useTrackOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSaveAddressesMutation,
  useSyncWishlistMutation,
  useSendContactMessageMutation,
} = shopApi;
