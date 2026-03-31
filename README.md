# Company Ledger（公司台账）

公司账目记录系统，用于台账的收集和整理，生成月度、季度和年度收支情况报告。

## ⭐ 功能特性

- 📊 **收入/支出台账** - 完整的 CRUD 操作
- 📁 **分类管理** - 收入/支出分类，支持树形结构
- 💰 **账户管理** - 现金/银行/支付宝/微信
- 👥 **用户管理** - 多用户支持，角色区分（管理员/普通用户）
- 📈 **报表统计** - 月度/季度/年度报表
- 📊 **可视化图表** - 饼图/柱状图/折线图
- 📤 **Excel 导出** - 支持收入/支出/报表导出
- 🔍 **数据查询** - 按日期/分类/账户筛选
- 📝 **操作日志** - 完整审计追踪（管理员可见）
- 🔐 **安全认证** - JWT Token + bcrypt 加密

## 🛠 技术栈

- **前端**: Vue 3 + Vite + Element Plus + Chart.js + Pinia
- **后端**: Node.js + Express + Prisma
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT + bcrypt

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /Users/wuxiaojun/Work/openclaw/projects/company-ledger

# 一键安装（推荐）
./install.sh

# 或手动安装
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. 初始化数据库

```bash
cd /Users/wuxiaojun/Work/openclaw/projects/company-ledger/backend
npx prisma migrate dev --name init
node ../database/seed.js

# 生成测试数据（可选）
node ../database/generate-test-data.js
```

### 3. 启动开发服务器

```bash
cd /Users/wuxiaojun/Work/openclaw/projects/company-ledger

# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:backend   # 后端 http://localhost:3000
npm run dev:frontend  # 前端 http://localhost:5173
```

### 4. 访问系统

打开浏览器访问：http://localhost:5173

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user | user123 |

## 📁 项目结构

```
company-ledger/
├── backend/                   # Node.js 后端
│   ├── src/
│   │   ├── routes/            # API 路由 (8个模块)
│   │   ├── services/          # 业务逻辑
│   │   ├── middleware/       # 中间件 (auth, logger)
│   │   ├── prisma.js          # 数据库客户端
│   │   └── app.js             # 入口文件
│   ├── prisma/
│   │   └── schema.prisma      # 数据模型
│   └── package.json
├── frontend/                  # Vue 3 前端
│   ├── src/
│   │   ├── components/        # 公共组件
│   │   ├── views/             # 页面组件 (7个)
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── api/               # API 接口
│   │   └── router/            # 路由配置
│   └── package.json
├── database/                  # 数据库脚本
│   ├── schema.prisma           # Prisma 模型
│   ├── seed.js                 # 初始数据
│   └── generate-test-data.js  # 测试数据生成
├── docs/                      # 项目文档
│   ├── README.md              # 项目说明
│   ├── API_DOCS.md            # API 接口文档
│   ├── MODULE_ANALYSIS.md     # 模块分析
│   ├── TODO.md                # 开发计划
│   └── BRANCH_GUIDE.md        # 分支管理规范
└── package.json
```

## 📚 API 文档

完整 API 接口文档见 [API_DOCS.md](./API_DOCS.md)

### 主要接口

| 模块 | 接口数 | 说明 |
|------|--------|------|
| 认证 | 5 | 登录/登出/密码/用户信息 |
| 用户管理 | 3 | 创建/列表/启用禁用 |
| 收入 | 5 | CRUD + 查询 |
| 支出 | 5 | CRUD + 查询 |
| 分类 | 4 | CRUD |
| 账户 | 5 | CRUD |
| 报表 | 4 | 月/季/年/仪表盘 |
| 导出 | 4 | Excel 导出 |
| 日志 | 2 | 列表 + 统计 |

## 📋 开发计划

- [x] 项目初始化
- [x] 数据库设计
- [x] 后端 API 开发
- [x] 前端页面开发
- [x] 报表图表
- [x] Excel 导出
- [x] 用户认证 (JWT)
- [x] 操作日志
- [ ] Excel 数据导入
- [ ] 预算管理
- [ ] 云服务器部署

## 📖 文档索引

| 文档 | 说明 |
|------|------|
| [README.md](./README.md) | 项目说明（本文档）|
| [API_DOCS.md](./API_DOCS.md) | API 接口文档 |
| [MODULE_ANALYSIS.md](./MODULE_ANALYSIS.md) | 模块分析与迭代规划 |
| [TODO.md](./TODO.md) | 开发计划与待办事项 |
| [BRANCH_GUIDE.md](./BRANCH_GUIDE.md) | 分支管理规范 |
| [GITHUB_BRANCH_PROTECTION.md](./GITHUB_BRANCH_PROTECTION.md) | GitHub 分支保护设置 |

## 🔗 相关链接

- GitHub 仓库：https://github.com/frankwu83/company-ledger

## License

MIT