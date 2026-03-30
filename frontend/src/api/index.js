import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 收入 API
export const incomeApi = {
  getAll: (params) => api.get('/income', { params }),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`)
}

// 支出 API
export const expenseApi = {
  getAll: (params) => api.get('/expense', { params }),
  getById: (id) => api.get(`/expense/${id}`),
  create: (data) => api.post('/expense', data),
  update: (id, data) => api.put(`/expense/${id}`, data),
  delete: (id) => api.delete(`/expense/${id}`)
}

// 分类 API
export const categoryApi = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

// 账户 API
export const accountApi = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`)
}

// 报表 API
export const reportApi = {
  getMonthly: (params) => api.get('/reports/monthly', { params }),
  getQuarterly: (params) => api.get('/reports/quarterly', { params }),
  getYearly: (params) => api.get('/reports/yearly', { params }),
  getDashboard: () => api.get('/reports/dashboard')
}

// 导出 API
export const exportApi = {
  exportIncome: (params) => api.get('/export/income', { params, responseType: 'blob' }),
  exportExpense: (params) => api.get('/export/expense', { params, responseType: 'blob' }),
  exportMonthly: (params) => api.get('/export/monthly', { params, responseType: 'blob' }),
  exportYearly: (params) => api.get('/export/yearly', { params, responseType: 'blob' })
}

export default api