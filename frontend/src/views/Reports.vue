<template>
  <div class="reports">
    <!-- 报表类型选择 -->
    <el-card class="toolbar">
      <el-radio-group v-model="reportType" @change="handleTypeChange">
        <el-radio-button label="monthly">月度报表</el-radio-button>
        <el-radio-button label="quarterly">季度报表</el-radio-button>
        <el-radio-button label="yearly">年度报表</el-radio-button>
      </el-radio-group>

      <el-date-picker
        v-if="reportType === 'monthly'"
        v-model="monthValue"
        type="month"
        placeholder="选择月份"
        style="margin-left: 20px; width: 150px"
        @change="fetchReport"
      />

      <el-select
        v-if="reportType === 'quarterly'"
        v-model="quarterValue"
        placeholder="选择季度"
        style="margin-left: 20px; width: 150px"
        @change="fetchReport"
      >
        <el-option label="第一季度" :value="1" />
        <el-option label="第二季度" :value="2" />
        <el-option label="第三季度" :value="3" />
        <el-option label="第四季度" :value="4" />
      </el-select>

      <el-date-picker
        v-if="reportType === 'yearly'"
        v-model="yearValue"
        type="year"
        placeholder="选择年份"
        style="margin-left: 20px; width: 150px"
        @change="fetchReport"
      />

      <el-button type="primary" style="margin-left: 20px" @click="exportReport">
        <el-icon><Download /></el-icon>导出Excel
      </el-button>
    </el-card>

    <!-- 汇总卡片 -->
    <el-row :gutter="20" class="summary-row" v-if="currentReport">
      <el-col :span="8">
        <el-card class="summary-card income">
          <div class="summary-title">总收入</div>
          <div class="summary-value">¥{{ formatMoney(currentReport.totalIncome) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="summary-card expense">
          <div class="summary-title">总支出</div>
          <div class="summary-value">¥{{ formatMoney(currentReport.totalExpense) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="summary-card balance">
          <div class="summary-title">结余</div>
          <div class="summary-value">¥{{ formatMoney(currentReport.balance) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类统计 -->
    <el-row :gutter="20" class="charts-row" v-if="currentReport">
      <el-col :span="12">
        <el-card>
          <template #header>收入分类</template>
          <el-table :data="currentReport.incomeByCategory" style="width: 100%">
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="amount" label="金额" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column label="占比" align="right">
              <template #default="{ row }">
                {{ calculatePercentage(row.amount, currentReport.totalIncome) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>支出分类</template>
          <el-table :data="currentReport.expenseByCategory" style="width: 100%">
            <el-table-column prop="category" label="分类" />
            <el-table-column prop="amount" label="金额" align="right">
              <template #default="{ row }">
                ¥{{ formatMoney(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column label="占比" align="right">
              <template #default="{ row }">
                {{ calculatePercentage(row.amount, currentReport.totalExpense) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 月度明细（仅年度报表显示） -->
    <el-row :gutter="20" class="detail-row" v-if="reportType === 'yearly' && currentReport?.monthlyData">
      <el-col :span="24">
        <el-card>
          <template #header>月度明细</template>
          <el-table :data="currentReport.monthlyData" style="width: 100%">
            <el-table-column prop="month" label="月份" width="100">
              <template #default="{ row }">
                {{ row.month }}月
              </template>
            </el-table-column>
            <el-table-column prop="income" label="收入" align="right">
              <template #default="{ row }">
                <span class="income-text">¥{{ formatMoney(row.income) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="expense" label="支出" align="right">
              <template #default="{ row }">
                <span class="expense-text">¥{{ formatMoney(row.expense) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="结余" align="right">
              <template #default="{ row }">
                <span :class="row.balance >= 0 ? 'income-text' : 'expense-text'">
                  ¥{{ formatMoney(row.balance) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useReportStore } from '../stores'

const reportStore = useReportStore()

const reportType = ref('monthly')
const monthValue = ref(new Date())
const quarterValue = ref(Math.ceil((new Date().getMonth() + 1) / 3))
const yearValue = ref(new Date())

const currentReport = computed(() => {
  if (reportType.value === 'monthly') return reportStore.monthlyReport
  if (reportType.value === 'yearly') return reportStore.yearlyReport
  return reportStore.monthlyReport
})

onMounted(() => {
  fetchReport()
})

const handleTypeChange = () => {
  fetchReport()
}

const fetchReport = async () => {
  const year = reportType.value === 'monthly' 
    ? monthValue.value?.getFullYear() 
    : yearValue.value?.getFullYear()

  if (reportType.value === 'monthly') {
    await reportStore.fetchMonthlyReport({
      year,
      month: monthValue.value?.getMonth() + 1
    })
  } else if (reportType.value === 'quarterly') {
    // 季度报表使用月度接口聚合
    await reportStore.fetchMonthlyReport({ year })
  } else if (reportType.value === 'yearly') {
    await reportStore.fetchYearlyReport({ year })
  }
}

const exportReport = () => {
  ElMessage.info('导出功能开发中...')
}

const formatMoney = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const calculatePercentage = (amount, total) => {
  if (!total || total === 0) return '0.00'
  return ((amount / total) * 100).toFixed(2)
}
</script>

<style scoped>
.reports {
  padding: 0;
}

.toolbar {
  margin-bottom: 20px;
}

.summary-row {
  margin-bottom: 20px;
}

.summary-card {
  text-align: center;
  padding: 20px;
}

.summary-card.income {
  background: linear-gradient(135deg, #67c23a20 0%, #85ce6120 100%);
}

.summary-card.expense {
  background: linear-gradient(135deg, #f56c6c20 0%, #f7898920 100%);
}

.summary-card.balance {
  background: linear-gradient(135deg, #409eff20 0%, #66b1ff20 100%);
}

.summary-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.charts-row {
  margin-bottom: 20px;
}

.detail-row {
  margin-bottom: 20px;
}

.income-text {
  color: #67c23a;
}

.expense-text {
  color: #f56c6c;
}
</style>