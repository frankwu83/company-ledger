<template>
  <div class="income">
    <!-- 操作栏 -->
    <el-card class="toolbar">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>新增收入
          </el-button>
        </el-col>
        <el-col :span="18">
          <el-row :gutter="10" justify="end">
            <el-col :span="8">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
                @change="handleFilterChange"
              />
            </el-col>
            <el-col :span="6">
              <el-select v-model="filter.categoryId" placeholder="选择分类" clearable @change="handleFilterChange">
                <el-option
                  v-for="cat in categoryStore.incomeCategories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="filter.accountId" placeholder="选择账户" clearable @change="handleFilterChange">
                <el-option
                  v-for="acc in accountStore.accounts"
                  :key="acc.id"
                  :label="acc.name"
                  :value="acc.id"
                />
              </el-select>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="incomeStore.incomes" v-loading="incomeStore.loading" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="category.name" label="分类" width="120" />
        <el-table-column prop="account.name" label="账户" width="120" />
        <el-table-column prop="amount" label="金额" width="150" align="right">
          <template #default="{ row }">
            <span class="amount income">+¥{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑收入' : '新增收入'"
      width="500px"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="2"
            :step="100"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="cat in categoryStore.incomeCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账户" prop="accountId">
          <el-select v-model="form.accountId" placeholder="选择账户" style="width: 100%">
            <el-option
              v-for="acc in accountStore.accounts"
              :key="acc.id"
              :label="acc.name"
              :value="acc.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="可选"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useIncomeStore, useCategoryStore, useAccountStore } from '../stores'

const incomeStore = useIncomeStore()
const categoryStore = useCategoryStore()
const accountStore = useAccountStore()

const showAddDialog = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const dateRange = ref(null)

const filter = reactive({
  categoryId: null,
  accountId: null
})

const form = reactive({
  id: null,
  date: new Date(),
  amount: 0,
  categoryId: null,
  accountId: null,
  description: ''
})

const rules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择账户', trigger: 'change' }]
}

onMounted(() => {
  incomeStore.fetchIncomes()
  categoryStore.fetchCategories()
  accountStore.fetchAccounts()
})

const handleFilterChange = () => {
  const params = {}
  if (dateRange.value) {
    params.startDate = dateRange.value[0].toISOString().split('T')[0]
    params.endDate = dateRange.value[1].toISOString().split('T')[0]
  }
  if (filter.categoryId) params.categoryId = filter.categoryId
  if (filter.accountId) params.accountId = filter.accountId
  incomeStore.fetchIncomes(params)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    date: new Date(row.date),
    amount: parseFloat(row.amount),
    categoryId: row.categoryId,
    accountId: row.accountId,
    description: row.description
  })
  showAddDialog.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除这条收入记录吗？', '提示', {
      type: 'warning'
    })
    const res = await incomeStore.deleteIncome(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const data = {
      date: form.date.toISOString().split('T')[0],
      amount: form.amount,
      categoryId: form.categoryId,
      accountId: form.accountId,
      description: form.description
    }

    let res
    if (isEdit.value) {
      res = await incomeStore.updateIncome(form.id, data)
    } else {
      res = await incomeStore.createIncome(data)
    }

    if (res.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      showAddDialog.value = false
      resetForm()
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    date: new Date(),
    amount: 0,
    categoryId: null,
    accountId: null,
    description: ''
  })
  formRef.value?.resetFields()
}

const formatMoney = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.income {
  padding: 0;
}

.toolbar {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.amount {
  font-weight: bold;
  font-size: 16px;
}

.amount.income {
  color: #67c23a;
}
</style>