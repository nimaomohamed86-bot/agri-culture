import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),

  getOne: (id) => api.get(`/products/${id}`),

  create: (formData) =>
    api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  updateQuantity: (id, data) =>
    api.patch(`/products/${id}/quantity`, data),

  delete: (id) =>
    api.delete(`/products/${id}`),

  getCategories: () =>
    api.get('/products/categories'),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getSuppliers: () => api.get('/users/suppliers'),
  getFarmers: () => api.get('/users/farmers'),

  createSupplier: (data) => api.post('/users/suppliers', data),
  updateSupplier: (id, data) => api.put(`/users/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/users/suppliers/${id}`),
  
};

export const orderApi = {
  getCart: () => api.get('/orders/cart'),

  addToCart: (data) => api.post('/orders/cart', data),

  updateCartItem: (itemId, data) =>
    api.put(`/orders/cart/${itemId}`, data),

  removeFromCart: (itemId) =>
    api.delete(`/orders/cart/${itemId}`),

  checkout: () => api.post('/orders/checkout'),

  getAll: (params) => api.get('/orders', { params }),

  getOne: (id) => api.get(`/orders/${id}`),

  create: (data) => api.post('/orders', data),

  update: (id, data) => api.put(`/orders/${id}`, data),

  delete: (id) => api.delete(`/orders/${id}`),

  updateStatus: (id, data) =>
    api.patch(`/orders/${id}/status`, data),

  cancel: (id) =>
    api.patch(`/orders/${id}/cancel`),

  getInvoice: (id) =>
    api.get(`/orders/${id}/invoice`),
};
export const deliveryApi = {
  getAll: (params) => api.get('/deliveries', { params }),
  getOne: (id) => api.get(`/deliveries/${id}`),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  assignDriver: (orderId, data) =>
    api.post(`/deliveries/assign/${orderId}`, data),
};

export const inventoryApi = {
  getAll: (params) => api.get('/inventory', { params }),
  getHistory: (params) => api.get('/inventory/history', { params }),

  updateMinimum: (productId, data) =>
    api.patch(`/inventory/${productId}/minimum`, data),

  stockIn: (productId, data) =>
    api.post(`/inventory/${productId}/stock-in`, data),

  stockOut: (productId, data) =>
    api.post(`/inventory/${productId}/stock-out`, data),
};

export const reportApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSales: (params) => api.get('/reports/sales', { params }),
  getInventory: () => api.get('/reports/inventory'),
  getSuppliers: () => api.get('/reports/suppliers'),
  getCustomers: () => api.get('/reports/customers'),
  getFarmerEarnings: () => api.get('/reports/farmer-earnings'),

  exportSalesExcel: () =>
    api.get('/reports/export/sales/excel', {
      responseType: 'blob',
    }),

  exportSalesPDF: () =>
    api.get('/reports/export/sales/pdf', {
      responseType: 'blob',
    }),
};

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const auditApi = {
  getAll: (params) => api.get('/audit-logs', { params }),
};
