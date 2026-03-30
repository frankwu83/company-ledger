import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { incomeApi, expenseApi, categoryApi, accountApi, reportApi } from '../api'

// 收入 Store
export const useIncomeStore = defineStore('income', () => {
  const incomes = ref([])
  const loading = ref(false)

  const fetchIncomes = async (params = {}) => {
    loading.value = true
    try {
      const res = await incomeApi.getAll(params)
      if (res.success) {
        incomes.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  const createIncome = async (data) => {
    const res = await incomeApi.create(data)
    if (res.success) {
      incomes.value.unshift(res.data)
    }
    return res
  }

  const updateIncome = async (id, data) => {
    const res = await incomeApi.update(id, data)
    if (res.success) {
      const index = incomes.value.findIndex(i => i.id === id)
      if (index !== -1) {
        incomes.value[index] = res.data
      }
    }
    return res
  }

  const deleteIncome = async (id) => {
    const res = await incomeApi.delete(id)
    if (res.success) {
      incomes.value = incomes.value.filter(i => i.id !== id)
    }
    return res
  }

  return {
    incomes,
    loading,
    fetchIncomes,
    createIncome,
    updateIncome,
    deleteIncome
  }
})

// 支出 Store
export const useExpenseStore = defineStore('expense', () => {
  const expenses = ref([])
  const loading = ref(false)

  const fetchExpenses = async (params = {}) => {
    loading.value = true
    try {
      const res = await expenseApi.getAll(params)
      if (res.success) {
        expenses.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  const createExpense = async (data) => {
    const res = await expenseApi.create(data)
    if (res.success) {
      expenses.value.unshift(res.data)
    }
    return res
  }

  const updateExpense = async (id, data) => {
    const res = await expenseApi.update(id, data)
    if (res.success) {
      const index = expenses.value.findIndex(e => e.id === id)
      if (index !== -1) {
        expenses.value[index] = res.data
      }
    }
    return res
  }

  const deleteExpense = async (id) => {
    const res = await expenseApi.delete(id)
    if (res.success) {
      expenses.value = expenses.value.filter(e => e.id !== id)
    }
    return res
  }

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense
  }
})

// 分类 Store
export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading = ref(false)

  const incomeCategories = computed(() => 
    categories.value.filter(c => c.type === 'income')
  )
  
  const expenseCategories = computed(() => 
    categories.value.filter(c => c.type === 'expense')
  )

  const fetchCategories = async (params = {}) => {
    loading.value = true
    try {
      const res = await categoryApi.getAll(params)
      if (res.success) {
        categories.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    incomeCategories,
    expenseCategories,
    fetchCategories
  }
})

// 账户 Store
export const useAccountStore = defineStore('account', () => {
  const accounts = ref([])
  const loading = ref(false)

  const fetchAccounts = async () => {
    loading.value = true
    try {
      const res = await accountApi.getAll()
      if (res.success) {
        accounts.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    loading,
    fetchAccounts
  }
})

// 报表 Store
export const useReportStore = defineStore('report', () => {
  const dashboard = ref(null)
  const monthlyReport = ref(null)
  const yearlyReport = ref(null)
  const loading = ref(false)

  const fetchDashboard = async () => {
    loading.value = true
    try {
      const res = await reportApi.getDashboard()
      if (res.success) {
        dashboard.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  const fetchMonthlyReport = async (params) => {
    loading.value = true
    try {
      const res = await reportApi.getMonthly(params)
      if (res.success) {
        monthlyReport.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  const fetchYearlyReport = async (params) => {
    loading.value = true
    try {
      const res = await reportApi.getYearly(params)
      if (res.success) {
        yearlyReport.value = res.data
      }
    } finally {
      loading.value = false
    }
  }

  return {
    dashboard,
    monthlyReport,
    yearlyReport,
    loading,
    fetchDashboard,
    fetchMonthlyReport,
    fetchYearlyReport
  }
})