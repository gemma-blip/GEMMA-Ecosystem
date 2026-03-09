import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gemma_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gemma_admin_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (password) => apiClient.post('/auth-login', { password }),
  verify: () => apiClient.post('/auth-verify'),
};

export const insightsAPI = {
  generate: (topic, language) => apiClient.post('/insights-generate', { topic, language }),
  list: (status) => apiClient.get(`/insights-list?status=${status}`),
  approve: (articleId) => apiClient.post('/insights-approve', { articleId }),
  publish: (articleId) => apiClient.post('/insights-publish', { articleId }),
  delete: (articleId, status) => apiClient.post('/insights-delete', { articleId, status }),
};

export const radarAPI = {
  feed: (limit = 10) => apiClient.get(`/radar-feed?limit=${limit}`),
};

export default apiClient;
