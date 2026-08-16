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
  categories: () => client.get('/admin/categories'),
  category: (id) => client.get(`/admin/categories/${id}`),
  createCategory: (data) => client.post('/admin/categories', data),
  updateCategory: (id, data) => client.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => client.delete(`/admin/categories/${id}`),
  orders: (params) => client.get('/admin/orders', { params }),
  order: (id) => client.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),
};
