# GitHub 分支保护设置指南

## 设置步骤

### 1. 登录 GitHub 仓库

访问：https://github.com/frankwu83/company-ledger

### 2. 进入设置

点击 **Settings** → **Branches**

### 3. 添加分支保护规则

点击 **Add rule** 按钮

### 4. 配置规则

#### 规则名称

- Branch name pattern: `main`

#### 保护选项

✅ **Restrict pushes that create files larger than 100 MB**  
✅ **Require a pull request before merging**  
- ✅ **Require approvals: 1**
- ⬜ **Dismiss stale PR approvals when new commits are pushed**
- ⬜ **Require review from Code Owners**
- ⬜ **Restrict who can dismiss pull request reviews**
- ⬜ **Require status checks to pass before merging**
- ⬜ **Require conversation resolution before merging**

✅ **Require signed commits**（可选，推荐）  
✅ **Include administrators**  
⬜ **Restrict who can push to matching branches**  
⬜ **Allow force pushes**  
⬜ **Allow deletions**

### 5. 保存

点击 **Create** 按钮

---

## 验证设置

设置完成后，尝试直接推送 main 分支会收到错误提示：

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: At least 1 approving review is required by reviewers with write access.
```

---

## 快速链接

- [分支指南](./BRANCH_GUIDE.md)
- [PR 模板](./PULL_REQUEST_TEMPLATE.md)
