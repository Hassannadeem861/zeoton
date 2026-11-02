import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminLogin: build.mutation({
      query: (body) => ({ url: '/admin/auth/login', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),
    getDashboard: build.query({ query: () => '/admin/dashboard', providesTags: ['Dashboard'] }),

    // Products
    getAdminProducts: build.query({
      query: (params) => ({ url: '/admin/products', params }),
      providesTags: (r) => [
        { type: 'Product', id: 'LIST' },
        ...(r?.items || []).map((p) => ({ type: 'Product', id: p._id })),
      ],
    }),
    getAdminProduct: build.query({
      query: (id) => `/admin/products/${id}`,
      transformResponse: (r) => r.product,
      providesTags: (r, e, id) => [{ type: 'Product', id }],
    }),
    createProduct: build.mutation({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard', 'Category'],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }, 'Dashboard', 'Category'],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard', 'Category'],
    }),
    // Optimistic stock edit in the inventory table.
    updateStock: build.mutation({
      query: ({ id, listArgs, ...body }) => ({ url: `/admin/products/${id}/stock`, method: 'PATCH', body }),
      async onQueryStarted({ id, stock, variants, listArgs }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          adminApi.util.updateQueryData('getAdminProducts', listArgs, (draft) => {
            const p = draft.items.find((x) => x._id === id);
            if (!p) return;
            if (stock != null) p.stock = stock;
            if (variants) variants.forEach((v) => {
              const t = p.variants.find((x) => x._id === v._id);
              if (t) t.stock = v.stock;
            });
            p.totalStock = p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Dashboard'],
    }),

    // Categories
    getAdminCategories: build.query({
      query: () => '/admin/categories',
      transformResponse: (r) => r.items,
      providesTags: ['Category'],
    }),
    createCategory: build.mutation({ query: (body) => ({ url: '/admin/categories', method: 'POST', body }), invalidatesTags: ['Category'] }),
    updateCategory: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: build.mutation({ query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }), invalidatesTags: ['Category'] }),

    // Orders
    getAdminOrders: build.query({ query: (params) => ({ url: '/admin/orders', params }), providesTags: [{ type: 'Order', id: 'LIST' }] }),
    getAdminOrder: build.query({
      query: (id) => `/admin/orders/${id}`,
      transformResponse: (r) => r.order,
      providesTags: (r, e, id) => [{ type: 'Order', id }],
    }),
    updateOrder: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/orders/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }, 'Dashboard', { type: 'Product', id: 'LIST' }],
    }),

    // Customers
    getCustomers: build.query({ query: (params) => ({ url: '/admin/customers', params }), providesTags: ['Customer'] }),
    setCustomerActive: build.mutation({
      query: ({ id, isActive }) => ({ url: `/admin/customers/${id}`, method: 'PATCH', body: { isActive } }),
      invalidatesTags: ['Customer'],
    }),

    // Coupons
    getCoupons: build.query({ query: () => '/admin/coupons', transformResponse: (r) => r.items, providesTags: ['Coupon'] }),
    createCoupon: build.mutation({ query: (body) => ({ url: '/admin/coupons', method: 'POST', body }), invalidatesTags: ['Coupon'] }),
    updateCoupon: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/coupons/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: build.mutation({ query: (id) => ({ url: `/admin/coupons/${id}`, method: 'DELETE' }), invalidatesTags: ['Coupon'] }),

    // Messages
    getMessages: build.query({ query: (params) => ({ url: '/admin/messages', params }), providesTags: ['Message'] }),
    updateMessage: build.mutation({
      query: ({ id, status }) => ({ url: `/admin/messages/${id}`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Message', 'Dashboard'],
    }),
    deleteMessage: build.mutation({ query: (id) => ({ url: `/admin/messages/${id}`, method: 'DELETE' }), invalidatesTags: ['Message', 'Dashboard'] }),

    // Settings
    getSettings: build.query({ query: () => '/admin/settings', transformResponse: (r) => r.settings, providesTags: ['Settings'] }),
    updateSettings: build.mutation({
      query: ({ key, value }) => ({ url: `/admin/settings/${key}`, method: 'PUT', body: value }),
      invalidatesTags: ['Settings'],
    }),

    updateAdminProfile: build.mutation({
      query: (body) => ({ url: '/admin/profile', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useGetDashboardQuery,
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateStockMutation,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateOrderMutation,
  useGetCustomersQuery,
  useSetCustomerActiveMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetMessagesQuery,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateAdminProfileMutation,
} = adminApi;
