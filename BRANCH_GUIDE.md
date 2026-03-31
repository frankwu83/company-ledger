# 分支管理指南

本文档定义了 company-ledger 项目的 Git 分支管理策略。

## 采用策略：GitHub Flow

适用于：小团队 / 持续部署 / 快速迭代

---

## 分支类型

| 分支 | 用途 | 生命周期 |
|------|------|---------|
| `main` | 主分支，永远可部署 | 永久 |
| `feature/*` | 新功能开发 | 临时 |
| `fix/*` | Bug 修复 | 临时 |
| `docs/*` | 文档更新 | 临时 |
| `refactor/*` | 代码重构 | 临时 |

---

## 分支命名规范

```bash
# 功能分支
feature/user-auth          # 用户认证功能
feature/expense-export     # 支出导出功能

# 修复分支
fix/login-redirect         # 登录跳转修复
fix/chart-render           # 图表渲染问题

# 文档分支
docs/api-reference         # API 文档更新

# 重构分支
refactor/database-layer   # 数据库层重构
```

---

## 工作流程

### 1. 开始新功能

```bash
# 确保 main 最新
git checkout main
git pull origin main

# 创建功能分支
git checkout -b feature/your-feature-name
```

### 2. 开发与提交

```bash
# 提交规范
# type: subject
# 示例：
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复登录页面白屏问题"
git commit -m "docs: 更新 API 文档"

# 提交类型
| type     | 说明                     |
|----------|------------------------|
| feat     | 新功能                  |
| fix      | Bug 修复                |
| docs     | 文档更新                |
| refactor | 代码重构（不影响功能）   |
| style    | 代码格式（空格/分号等） |
| test     | 测试相关                |
| chore    | 构建/工具链更新         |
```

### 3. 推送分支

```bash
# 首次推送，设置上游分支
git push -u origin feature/your-feature-name
```

### 4. 创建 Pull Request

- 标题格式：`[类型] 简短描述`
- 内容填写 PR 模板
- 关联相关 Issue（可选）

### 5. 代码审查与合并

- 至少 1 人审查通过后方可合并
- 合并后删除功能分支

### 6. 清理本地分支

```bash
# 删除已合并的本地分支
git branch -d feature/your-feature-name
```

---

## 分支保护规则（GitHub 设置）

在 GitHub 仓库设置中配置：

### main 分支保护

- ✅ 禁止直接推送（Require branch to be up to date）
- ✅ 需要 Pull Request
- ✅ 需要 1 人审查通过
- ✅ 禁止强制推送

---

## 常用命令速查

```bash
# 查看所有分支
git branch -a

# 切换分支
git checkout feature/xxx

# 创建并切换
git checkout -b feature/xxx

# 删除本地分支
git branch -d feature/xxx

# 删除远程分支
git push origin --delete feature/xxx

# 拉取远程分支
git fetch origin
git checkout -b feature/xxx origin/feature/xxx
```

---

## 注意事项

1. **保持提交小而完整** — 每个提交应该是独立的逻辑单元
2. **经常同步 main** — 定期从 main 拉取更新，避免合并冲突
3. **描述性提交信息** — 便于追溯和理解
4. **合并后删除分支** — 保持仓库整洁

---

_创建时间：2026-03-31_
