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
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.data)
    return response.data
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message)
    // 401 未登录或 token 过期
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// 认证 API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/password', data),
  // 管理员接口
  createUser: (data) => api.post('/auth/users', data),
  getUsers: () => api.get('/auth/users'),
  toggleUser: (id) => api.put(`/auth/users/${id}/toggle`)
}

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

// 日志 API
export const logApi = {
  getLogs: (params) => api.get('/logs', { params }),
  getStats: (params) => api.get('/logs/stats', { params })
}

export default api