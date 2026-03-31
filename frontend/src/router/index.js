import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: '/income',
        name: 'Income',
        component: () => import('../views/Income.vue'),
        meta: { title: '收入管理' }
      },
      {
        path: '/expense',
        name: 'Expense',
        component: () => import('../views/Expense.vue'),
        meta: { title: '支出管理' }
      },
      {
        path: '/reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue'),
        meta: { title: '报表统计' }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 公司台账` : '公司台账'
  
  const token = localStorage.getItem('token')
  
  // 公开页面直接放行
  if (to.meta.public) {
    // 已登录访问登录页，跳转到首页
    if (token && to.path === '/login') {
      next('/')
      return
    }
    next()
    return
  }
  
  // 需要登录的页面
  if (!token) {
    next('/login')
    return
  }
  
  next()
})

export default router