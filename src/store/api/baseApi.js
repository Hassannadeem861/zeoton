import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// One API slice; domain endpoints are injected from separate files.
// Auth uses the HttpOnly session cookie, which the browser sends automatically.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'same-origin' }),
  tagTypes: ['Me', 'Product', 'Category', 'Order', 'MyOrder', 'Customer', 'Coupon', 'Message', 'Settings', 'Dashboard', 'Profile', 'Wishlist'],
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
