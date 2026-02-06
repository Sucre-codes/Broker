import axios from 'axios';


 const apiBaseUrl = 'https://elonfather.onrender.com/api';
    const BaseUrl = apiBaseUrl;

const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
   forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data)
};

// Investment endpoints
export const investmentAPI = {
  getAll: () => api.get('/investments'),
  getOne: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  calculate: (data) => api.post('/investments/calculate', data),
  getDashboardStats: () => api.get('/investments/dashboard/stats')
};

// Payment endpoints
export const paymentAPI = {
   initiatePayment: (data) => api.post('/payments/initiate', data),
  // Crypto
  getCryptoDetails: (currency, amount) => api.get(`/payments/crypto/${currency}?amount=${amount}`),
  submitCryptoPayment: (data) => api.post('/payments/crypto/submit', data),
  
  // Wire Transfer
  getWireDetails: () => api.get('/payments/wire/details'),
  submitWireTransfer: (data) => api.post('/payments/wire/submit', data)
};

// Withdrawal endpoints
export const withdrawalAPI = {
  getAll: () => api.get('/withdrawals'),
  getOne: (id) => api.get(`/withdrawals/${id}`),
  request: (data) => api.post('/withdrawals', data)
};

// Transaction endpoints
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`)
};

// User endpoints
export const userAPI = {
  getStats: () => api.get('/users/stats'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  uploadProfilePicture: (data) => api.post('/users/profile-picture', data),
  uploadPictureFile: (formData) => api.post('/users/upload-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Admin endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingInvestments: () => api.get('/admin/investments/pending'),
  sendPaymentDetails: (investmentId, data) =>
    api.post(`/admin/payments/send-details/${investmentId}`, data),
  approveCryptoPayment: (investmentId) =>
    api.put(`/admin/payments/crypto/approve/${investmentId}`),
  rejectCryptoPayment: (investmentId, data) =>
    api.put(`/admin/payments/crypto/reject/${investmentId}`, data),
  approveWirePayment: (investmentId) =>
    api.put(`/admin/payments/wire/approve/${investmentId}`),
  rejectWirePayment: (investmentId, data) =>
    api.put(`/admin/payments/wire/reject/${investmentId}`, data),
  getUsers: () => api.get('/admin/users')
};


export default api;
