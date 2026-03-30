import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes = [
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router