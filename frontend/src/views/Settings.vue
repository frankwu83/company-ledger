<template>
  <div class="settings">
    <el-tabs type="border-card">
      <!-- 分类管理 -->
      <el-tab-pane label="分类管理">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>收入分类</span>
                    <el-button type="primary" size="small" @click="showAddCategory('income')">
                      <el-icon><Plus /></el-icon>新增
                    </el-button>
                  </div>
                </template>
                <el-table :data="categoryStore.incomeCategories" style="width: 100%">
                  <el-table-column prop="name" label="分类名称" />
                  <el-table-column label="操作" width="100" align="right">
                    <template #default="{ row }">
                      <el-button type="danger" link @click="deleteCategory(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>支出分类</span>
                    <el-button type="primary" size="small" @click="showAddCategory('expense')">
                      <el-icon><Plus /></el-icon>新增
                    </el-button>
                  </div>
                </template>
                <el-table :data="categoryStore.expenseCategories" style="width: 100%">
                  <el-table-column prop="name" label="分类名称" />
                  <el-table-column label="操作" width="100" align="right">
                    <template #default="{ row }">
                      <el-button type="danger" link @click="deleteCategory(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 账户管理 -->
      <el-tab-pane label="账户管理">
        <div class="tab-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>账户列表</span>
                <el-button type="primary" @click="showAddAccount = true">
                  <el-icon><Plus /></el-icon>新增账户
                </el-button>
              </div>
            </template>
            <el-table :data="accountStore.accounts" style="width: 100%">
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
              <el-table-column label="操作" width="150" align="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="editAccount(row)">编辑</el-button>
                  <el-button type="danger" link @click="deleteAccount(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增分类对话框 -->
    <el-dialog v-model="showCategoryDialog" title="新增分类" width="400px">
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="categoryForm.type" disabled>
            <el-radio label="income">收入</el-radio>
            <el-radio label="expense">支出</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑账户对话框 -->
    <el-dialog v-model="showAddAccount" :title="isEditAccount ? '编辑账户' : '新增账户'" width="400px">
      <el-form :model="accountForm" label-width="80px">
        <el-form-item label="账户名称">
          <el-input v-model="accountForm.name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账户类型">
          <el-select v-model="accountForm.type" placeholder="选择类型" style="width: 100%">
            <el-option label="现金" value="cash" />
            <el-option label="银行" value="bank" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信支付" value="wechat" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始余额">
          <el-input-number v-model="accountForm.balance" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddAccount = false">取消</el-button>
        <el-button type="primary" @click="submitAccount">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCategoryStore, useAccountStore } from '../stores'
import { categoryApi, accountApi } from '../api'

const categoryStore = useCategoryStore()
const accountStore = useAccountStore()

const showCategoryDialog = ref(false)
const showAddAccount = ref(false)
const isEditAccount = ref(false)

const categoryForm = reactive({
  name: '',
  type: 'income'
})

const accountForm = reactive({
  id: null,
  name: '',
  type: 'cash',
  balance: 0
})

onMounted(() => {
  categoryStore.fetchCategories()
  accountStore.fetchAccounts()
})

const showAddCategory = (type) => {
  categoryForm.type = type
  categoryForm.name = ''
  showCategoryDialog.value = true
}

const submitCategory = async () => {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    const res = await categoryApi.create(categoryForm)
    if (res.success) {
      ElMessage.success('添加成功')
      showCategoryDialog.value = false
      categoryStore.fetchCategories()
    }
  } catch (error) {
    ElMessage.error(error.message || '添加失败')
  }
}

const deleteCategory = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除这个分类吗？', '提示', { type: 'warning' })
    const res = await categoryApi.delete(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      categoryStore.fetchCategories()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const editAccount = (row) => {
  isEditAccount.value = true
  Object.assign(accountForm, row)
  showAddAccount.value = true
}

const submitAccount = async () => {
  try {
    let res
    if (isEditAccount.value) {
      res = await accountApi.update(accountForm.id, accountForm)
    } else {
      res = await accountApi.create(accountForm)
    }
    if (res.success) {
      ElMessage.success(isEditAccount.value ? '更新成功' : '添加成功')
      showAddAccount.value = false
      accountStore.fetchAccounts()
      resetAccountForm()
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const deleteAccount = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除这个账户吗？', '提示', { type: 'warning' })
    const res = await accountApi.delete(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      accountStore.fetchAccounts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const resetAccountForm = () => {
  isEditAccount.value = false
  Object.assign(accountForm, {
    id: null,
    name: '',
    type: 'cash',
    balance: 0
  })
}

const getAccountTypeTag = (type) => {
  const map = { cash: 'success', bank: 'primary', alipay: 'warning', wechat: 'success' }
  return map[type] || 'info'
}

const getAccountTypeLabel = (type) => {
  const map = { cash: '现金', bank: '银行', alipay: '支付宝', wechat: '微信' }
  return map[type] || type
}

const formatMoney = (value) => {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped>
.settings {
  padding: 0;
}

.tab-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>