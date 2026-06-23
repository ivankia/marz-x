import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          original.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  },
);

export default api;

export const auth = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const users = {
  me: () => api.get('/users/me'),
  updateLang: (lang: string) => api.put('/users/me/lang', { lang }),
};

export const plans = {
  getAll: () => api.get('/plans'),
};

export const nodes = {
  getStatus: () => api.get('/nodes/status'),
};

export const subscriptions = {
  getMy: () => api.get('/subscriptions/me'),
  getConfig: () => api.get('/subscriptions/me/config'),
};

export const payments = {
  create: (planId: string, paymentMethod: number) =>
    api.post('/payments/create', { planId, paymentMethod }),
  getHistory: () => api.get('/payments/history'),
};
