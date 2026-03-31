# Company Ledger（公司台账）

公司账目记录系统，用于台账的收集和整理，生成月度、季度和年度收支情况报告。

## 技术栈

- **前端**: Vue 3 + Vite + Element Plus + Chart.js
- **后端**: Node.js + Express + Prisma
- **数据库**: SQLite (开发) / PostgreSQL (生产)

## 功能特性

- 📊 收入/支出台账录入
- 📁 分类管理（收入/支出分类）
- 💰 账户管理（现金/银行/支付宝/微信）
- 📈 月度/季度/年度报表
- 📊 可视化图表（饼图/柱状图/折线图）
- 📤 Excel 导出功能
- 🔍 数据查询与筛选

## 快速开始

### 1. 安装依赖

```bash
cd /Users/wuxiaojun/Work/openclaw/company-ledger

# 一键安装（推荐）
./install.sh

# 或手动安装
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. 初始化数据库

```bash
cd /Users/wuxiaojun/Work/openclaw/company-ledger/backend
npx prisma migrate dev --name init
node ../database/seed.js

# 生成测试数据（可选）
node ../database/generate-test-data.js
```

### 3. 启动开发服务器

```bash
cd /Users/wuxiaojun/Work/openclaw/company-ledger

# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend   # 后端 http://localhost:3000
npm run dev:frontend  # 前端 http://localhost:5173
```

## 项目结构

```
company-ledger/
├── backend/              # Node.js 后端
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务逻辑
│   │   └── app.js        # 入口文件
│   └── prisma/           # 数据库配置
├── frontend/             # Vue 3 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── stores/       # Pinia 状态管理
│   │   └── api/          # API 接口
│   └── package.json
├── database/             # 数据库脚本
│   ├── schema.prisma     # Prisma 模型
│   ├── seed.js           # 初始数据
│   └── generate-test-data.js
└── README.md
```

## API 文档

### 收入管理
- `GET /api/income` - 获取收入列表
- `POST /api/income` - 创建收入
- `PUT /api/income/:id` - 更新收入
- `DELETE /api/income/:id` - 删除收入

### 支出管理
- `GET /api/expense` - 获取支出列表
- `POST /api/expense` - 创建支出
- `PUT /api/expense/:id` - 更新支出
- `DELETE /api/expense/:id` - 删除支出

### 报表
- `GET /api/reports/monthly` - 月度报表
- `GET /api/reports/quarterly` - 季度报表
- `GET /api/reports/yearly` - 年度报表
- `GET /api/reports/dashboard` - 仪表盘数据

### 导出
- `GET /api/export/income` - 导出收入
- `GET /api/export/expense` - 导出支出
- `GET /api/export/monthly` - 导出月度报表
- `GET /api/export/yearly` - 导出年度报表

## 开发计划

- [x] 项目初始化
- [x] 数据库设计
- [x] 后端 API 开发
- [x] 前端页面开发
- [x] 报表图表
- [x] Excel 导出
- [ ] 用户认证
- [ ] 数据备份
- [ ] 部署文档

## License

MIT