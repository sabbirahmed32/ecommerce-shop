import client from './client';

export const authApi = {
  register: (data) => client.post('/register', data),
  login: (data) => client.post('/login', data),
  logout: () => client.post('/logout'),
  user: () => client.get('/user'),
  updateProfile: (data) => client.put('/user/profile', data),
  forgotPassword: (email) => client.post('/forgot-password', { email }),
  resetPassword: (data) => client.post('/reset-password', data),
};

export const homeApi = {
  home: () => client.get('/home'),
};

export const productApi = {
  list: (params) => client.get('/products', { params }),
  show: (slug) => client.get(`/products/${slug}`),
  bestSellers: () => client.get('/products/best-sellers'),
  reviews: (productId) => client.get(`/products/${productId}/reviews`),
  submitReview: (productId, data) => client.post(`/products/${productId}/reviews`, data),
};

export const categoryApi = {
  list: () => client.get('/categories'),
  show: (slug) => client.get(`/categories/${slug}`),
};

export const cartApi = {
  index: () => client.get('/cart'),
  add: (data) => client.post('/cart', data),
  update: (id, quantity) => client.patch(`/cart/${id}`, { quantity }),
  remove: (id) => client.delete(`/cart/${id}`),
  clear: () => client.delete('/cart'),
  applyCoupon: (code) => client.post('/cart/coupon', { code }),
  removeCoupon: () => client.delete('/cart/coupon'),
};

export const orderApi = {
  index: (params) => client.get('/orders', { params }),
  store: (data) => client.post('/orders', data),
  show: (id) => client.get(`/orders/${id}`),
  cancel: (id) => client.post(`/orders/${id}/cancel`),
};

export const wishlistApi = {
  index: () => client.get('/wishlist'),
  toggle: (productId) => client.post('/wishlist/toggle', { product_id: productId }),
  remove: (productId) => client.delete(`/wishlist/${productId}`),
};

export const adminApi = {
  dashboard: () => client.get('/admin/dashboard'),
  products: (params) => client.get('/admin/products', { params }),
  product: (id) => client.get(`/admin/products/${id}`),
  createProduct: (data) => client.post('/admin/products', data),
  updateProduct: (id, data) => client.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => client.delete(`/admin/products/${id}`),
  categories: (params) => client.get('/admin/categories', { params }),
  allCategories: () => client.get('/admin/categories/all'),
  category: (id) => client.get(`/admin/categories/${id}`),
  createCategory: (data) => client.post('/admin/categories', data),
  updateCategory: (id, data) => client.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => client.delete(`/admin/categories/${id}`),
  orders: (params) => client.get('/admin/orders', { params }),
  order: (id) => client.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),
  updateOrderPaymentStatus: (id, paymentStatus) => client.patch(`/admin/orders/${id}/payment-status`, { payment_status: paymentStatus }),
  customers: (params) => client.get('/admin/customers', { params }),
  customer: (id) => client.get(`/admin/customers/${id}`),
  blockCustomer: (id) => client.patch(`/admin/customers/${id}/block`),
  deleteCustomer: (id) => client.delete(`/admin/customers/${id}`),
  coupons: (params) => client.get('/admin/coupons', { params }),
  createCoupon: (data) => client.post('/admin/coupons', data),
  updateCoupon: (id, data) => client.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => client.delete(`/admin/coupons/${id}`),
  reviews: (params) => client.get('/admin/reviews', { params }),
  updateReviewStatus: (id, status) => client.patch(`/admin/reviews/${id}/status`, { status }),
  deleteReview: (id) => client.delete(`/admin/reviews/${id}`),
  brands: (params) => client.get('/admin/brands', { params }),
  allBrands: () => client.get('/admin/brands/all'),
  brand: (id) => client.get(`/admin/brands/${id}`),
  createBrand: (data) => client.post('/admin/brands', data),
  updateBrand: (id, data) => client.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => client.delete(`/admin/brands/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
