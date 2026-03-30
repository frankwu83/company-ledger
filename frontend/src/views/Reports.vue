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

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row" v-if="currentReport">
      <el-col :span="12">
        <el-card>
          <template #header>收入分类占比</template>
          <PieChart
            :data="incomeChartData.values"
            :labels="incomeChartData.labels"
            :colors="['#67c23a', '#85ce61', '#b3e19d', '#95d475', '#f0f9eb']"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>支出分类占比</template>
          <PieChart
            :data="expenseChartData.values"
            :labels="expenseChartData.labels"
            :colors="['#f56c6c', '#f78989', '#fab6b6', '#fcd3d3', '#fef0f0']"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 年度趋势图 -->
    <el-row :gutter="20" class="charts-row" v-if="reportType === 'yearly' && currentReport?.monthlyData">
      <el-col :span="12">
        <el-card>
          <template #header>月度收支对比</template>
          <BarChart
            :labels="monthlyLabels"
            :income-data="monthlyIncomeData"
            :expense-data="monthlyExpenseData"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>月度结余趋势</template>
          <LineChart
            :labels="monthlyLabels"
            :data="monthlyBalanceData"
            label="结余"
            color="#409eff"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 分类统计表格 -->
    <el-row :gutter="20" class="tables-row" v-if="currentReport">
      <el-col :span="12">
        <el-card>
          <template #header>收入分类明细</template>
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
          <template #header>支出分类明细</template>
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
import { exportApi } from '../api'
import PieChart from '../components/PieChart.vue'
import BarChart from '../components/BarChart.vue'
import LineChart from '../components/LineChart.vue'

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

// 图表数据计算
const incomeChartData = computed(() => {
  if (!currentReport.value?.incomeByCategory) return { labels: [], values: [] }
  return {
    labels: currentReport.value.incomeByCategory.map(item => item.category),
    values: currentReport.value.incomeByCategory.map(item => item.amount)
  }
})

const expenseChartData = computed(() => {
  if (!currentReport.value?.expenseByCategory) return { labels: [], values: [] }
  return {
    labels: currentReport.value.expenseByCategory.map(item => item.category),
    values: currentReport.value.expenseByCategory.map(item => item.amount)
  }
})

const monthlyLabels = computed(() => {
  if (!currentReport.value?.monthlyData) return []
  return currentReport.value.monthlyData.map(item => item.month + '月')
})

const monthlyIncomeData = computed(() => {
  if (!currentReport.value?.monthlyData) return []
  return currentReport.value.monthlyData.map(item => item.income)
})

const monthlyExpenseData = computed(() => {
  if (!currentReport.value?.monthlyData) return []
  return currentReport.value.monthlyData.map(item => item.expense)
})

const monthlyBalanceData = computed(() => {
  if (!currentReport.value?.monthlyData) return []
  return currentReport.value.monthlyData.map(item => item.balance)
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
    await reportStore.fetchMonthlyReport({ year })
  } else if (reportType.value === 'yearly') {
    await reportStore.fetchYearlyReport({ year })
  }
}

const exportReport = async () => {
  try {
    ElMessage.info('正在生成报表...')
    
    const year = reportType.value === 'monthly' 
      ? monthValue.value?.getFullYear() 
      : yearValue.value?.getFullYear()
    const month = monthValue.value?.getMonth() + 1
    
    let response
    let filename
    
    if (reportType.value === 'monthly') {
      response = await exportApi.exportMonthly({ year, month })
      filename = `月度报表_${year}_${month}.xlsx`
    } else if (reportType.value === 'yearly') {
      response = await exportApi.exportYearly({ year })
      filename = `年度报表_${year}.xlsx`
    } else {
      ElMessage.warning('季度报表导出请使用月度或年度导出')
      return
    }
    
    // 创建下载链接
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('报表导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + (error.message || '未知错误'))
  }
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

.tables-row {
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