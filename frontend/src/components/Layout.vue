<template>
  <el-container class="layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <el-icon :size="24"><Wallet /></el-icon>
        <span>公司台账</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        class="menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="/transactions">
          <template #title>
            <el-icon><List /></el-icon>
            <span>收支管理</span>
          </template>
          <el-menu-item index="/income">
            <el-icon><Top /></el-icon>
            <span>收入</span>
          </el-menu-item>
          <el-menu-item index="/expense">
            <el-icon><Bottom /></el-icon>
            <span>支出</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/reports">
          <el-icon><TrendCharts /></el-icon>
          <span>报表统计</span>
        </el-menu-item>

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <h2>{{ $route.meta?.title || '公司台账系统' }}</h2>
      </el-header>
      <el-main class="main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
</script>

<style scoped>
.layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.logo .el-icon {
  margin-right: 10px;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>