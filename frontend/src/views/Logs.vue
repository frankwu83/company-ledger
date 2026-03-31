<template>
  <div class="logs-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>操作日志</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.CREATE || 0 }}</div>
          <div class="stat-label">创建操作</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.UPDATE || 0 }}</div>
          <div class="stat-label">更新操作</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.DELETE || 0 }}</div>
          <div class="stat-label">删除操作</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.LOGIN + stats.LOGOUT || 0 }}</div>
          <div class="stat-label">登录/登出</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="操作类型">
          <el-select v-model="filterForm.action" placeholder="全部" clearable>
            <el-option label="创建" value="CREATE" />
            <el-option label="更新" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="登录" value="LOGIN" />
            <el-option label="登出" value="LOGOUT" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="filterForm.resource" placeholder="全部" clearable>
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
            <el-option label="用户" value="user" />
            <el-option label="分类" value="category" />
            <el-option label="账户" value="account" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <el-table :data="logs" stripe style="width: 100%">
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)">{{ getActionText(row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource" label="资源" width="100">
          <template #default="{ row }">
            {{ getResourceText(row.resource) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column label="详情" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="操作详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="时间">{{ formatDate(detailData.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ getActionText(detailData.action) }}</el-descriptions-item>
        <el-descriptions-item label="资源">{{ getResourceText(detailData.resource) }} #{{ detailData.resourceId }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailData.ip }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="detailData.oldValue || detailData.newValue" class="diff-section">
        <h4>数据变更</h4>
        <div v-if="detailData.oldValue" class="old-value">
          <h5>修改前:</h5>
          <pre>{{ JSON.stringify(detailData.oldValue, null, 2) }}</pre>
        </div>
        <div v-if="detailData.newValue" class="new-value">
          <h5>修改后:</h5>
          <pre>{{ JSON.stringify(detailData.newValue, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { logApi } from '../api'
import { ElMessage } from 'element-plus'

const logs = ref([])
const stats = ref({})
const filterForm = ref({
  action: '',
  resource: ''
})
const dateRange = ref([])
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const detailVisible = ref(false)
const detailData = ref({})

// 获取日志列表
const fetchLogs = async () => {
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filterForm.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res = await logApi.getLogs(params)
    logs.value = res.logs
    pagination.value.total = res.total
  } catch (error) {
    ElMessage.error('获取日志失败')
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    stats.value = await logApi.getStats()
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  fetchLogs()
}

// 重置
const handleReset = () => {
  filterForm.value = { action: '', resource: '' }
  dateRange.value = []
  pagination.value.page = 1
  fetchLogs()
}

// 日期范围变化
const handleDateChange = (val) => {
  if (val) {
    filterForm.value.startDate = val[0]
    filterForm.value.endDate = val[1]
  } else {
    delete filterForm.value.startDate
    delete filterForm.value.endDate
  }
}

// 分页变化
const handlePageChange = (page) => {
  pagination.value.page = page
  fetchLogs()
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchLogs()
}

// 查看详情
const showDetail = (row) => {
  detailData.value = row
  detailVisible.value = true
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取操作类型对应的标签样式
const getActionType = (action) => {
  const types = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
    LOGIN: 'info',
    LOGOUT: 'info'
  }
  return types[action] || ''
}

// 获取操作中文
const getActionText = (action) => {
  const texts = {
    CREATE: '创建',
    UPDATE: '更新',
    DELETE: '删除',
    LOGIN: '登录',
    LOGOUT: '登出'
  }
  return texts[action] || action
}

// 获取资源中文
const getResourceText = (resource) => {
  const texts = {
    income: '收入',
    expense: '支出',
    user: '用户',
    category: '分类',
    account: '账户'
  }
  return texts[resource] || resource
}

onMounted(() => {
  fetchLogs()
  fetchStats()
})
</script>

<style scoped>
.logs-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 400px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.diff-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.diff-section h4 {
  margin-bottom: 12px;
  color: #303133;
}

.old-value,
.new-value {
  margin-bottom: 12px;
}

.old-value h5,
.new-value h5 {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.old-value pre {
  background: #fef0f0;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.new-value pre {
  background: #f0f9eb;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>