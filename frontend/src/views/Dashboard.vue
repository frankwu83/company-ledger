<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card income">
          <div class="stat-icon">
            <el-icon :size="40"><Top /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">本月收入</div>
            <div class="stat-value">¥{{ formatMoney(dashboard?.monthIncome) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card expense">
          <div class="stat-icon">
            <el-icon :size="40"><Bottom /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">本月支出</div>
            <div class="stat-value">¥{{ formatMoney(dashboard?.monthExpense) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card balance">
          <div class="stat-icon">
            <el-icon :size="40"><Wallet /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">本月结余</div>
            <div class="stat-value">¥{{ formatMoney(dashboard?.monthBalance) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card total">
          <div class="stat-icon">
            <el-icon :size="40"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">账户总余额</div>
            <div class="stat-value">¥{{ formatMoney(dashboard?.totalBalance) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账户余额和最近交易 -->
    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>账户余额</span>
            </div>
          </template>
          <el-table :data="dashboard?.accounts" style="width: 100%">
            <el-table-column prop="name" label="账户名称" />
            <el-table-column prop="type" label="类型">
              <template #default="{ row }">
                <el-tag :type="getAccountTypeTag(row.type)">
                  {{ getAccountTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="余额" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.balance) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近收入</span>
              <el-button type="primary" link @click="$router.push('/income')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="dashboard?.recentTransactions?.incomes" style="width: 100%">
            <el-table-column prop="date" label="日期" width="100">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="category.name" label="分类" />
            <el-table-column prop="amount" label="金额" align="right">
              <template #default="{ row }">
                <span class="income-text">+¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近支出 -->
    <el-row :gutter="20" class="content-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近支出</span>
              <el-button type="primary" link @click="$router.push('/expense')">查看更多</el-button>
            </div>
          </template>
          <el-table :data="dashboard?.recentTransactions?.expenses" style="width: 100%">
            <el-table-column prop="date" label="日期" width="100">
              <template #default="{ row }">
                {{ formatDate(row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="category.name" label="分类" />
            <el-table-column prop="description" label="说明" show-overflow-tooltip />
            <el-table-column prop="amount" label="金额" align="right" width="120">
              <template #default="{ row }">
                <span class="expense-text">-¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useReportStore, useCategoryStore, useAccountStore } from '../stores'

const reportStore = useReportStore()
const categoryStore = useCategoryStore()
const accountStore = useAccountStore()

const { dashboard } = storeToRefs(reportStore)

onMounted(() => {
  console.log('Dashboard mounted, fetching data...')
  reportStore.fetchDashboard().then(() => {
    console.log('Dashboard data loaded:', dashboard.value)
  }).catch(err => {
    console.error('Failed to load dashboard:', err)
  })
  categoryStore.fetchCategories()
  accountStore.fetchAccounts()
})

const formatMoney = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getAccountTypeTag = (type) => {
  const map = {
    cash: 'success',
    bank: 'primary',
    alipay: 'warning',
    wechat: 'success'
  }
  return map[type] || 'info'
}

const getAccountTypeLabel = (type) => {
  const map = {
    cash: '现金',
    bank: '银行',
    alipay: '支付宝',
    wechat: '微信'
  }
  return map[type] || type
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-card.income {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.stat-card.expense {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.stat-card.balance {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.stat-card.total {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  color: white;
}

.stat-icon {
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.content-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.income-text {
  color: #67c23a;
  font-weight: bold;
}

.expense-text {
  color: #f56c6c;
  font-weight: bold;
}
</style>