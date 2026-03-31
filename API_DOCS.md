# Company Ledger API 接口文档

> 版本：1.0  
> 最后更新：2026-03-31  
> 基础 URL：`http://localhost:3000/api`

---

## 目录

1. [认证接口](#认证接口-auth)
2. [用户管理](#用户管理-authusers)
3. [收入管理](#收入管理-income)
4. [支出管理](#支出管理-expense)
5. [分类管理](#分类管理-categories)
6. [账户管理](#账户管理-accounts)
7. [报表接口](#报表接口-reports)
8. [数据导出](#数据导出-export)
9. [操作日志](#操作日志-logs)

---

## 通用说明

### 认证方式
除公开接口外，所有请求需要在 Header 中携带 Token：
```
Authorization: Bearer <token>
```

### 响应格式
```json
// 成功响应
{ "success": true, "data": {...} }

// 错误响应
{ "success": false, "error": "错误信息" }

// 分页响应
{ "success": true, "data": [...], "total": 100, "page": 1, "pageSize": 20 }
```

### 角色说明
| 角色 | 说明 |
|------|------|
| `admin` | 管理员，可访问所有接口 |
| `user` | 普通用户，标准权限 |

---

## 认证接口 (/auth)

### 1. 用户登录
```
POST /auth/login
```

**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "系统管理员",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 2. 用户登出
```
POST /auth/logout
```
- **权限**：需登录
- **认证**：Bearer Token

---

### 3. 获取当前用户信息
```
GET /auth/me
```
- **权限**：需登录
- **认证**：Bearer Token

**响应：**
```json
{
  "id": 1,
  "username": "admin",
  "name": "系统管理员",
  "email": "admin@example.com",
  "role": "admin",
  "isActive": true,
  "createdAt": "2026-03-31T00:00:00.000Z"
}
```

---

### 4. 更新当前用户信息
```
PUT /auth/me
```
- **权限**：需登录
- **认证**：Bearer Token

**请求体：**
```json
{
  "name": "新名称",
  "email": "newemail@example.com"
}
```

---

### 5. 修改密码
```
PUT /auth/password
```
- **权限**：需登录
- **认证**：Bearer Token

**请求体：**
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpass456"
}
```

---

## 用户管理 (/auth/users)

### 6. 获取所有用户（管理员）
```
GET /auth/users
```
- **权限**：仅管理员
- **认证**：Bearer Token

---

### 7. 创建用户（管理员）
```
POST /auth/users
```
- **权限**：仅管理员
- **认证**：Bearer Token

**请求体：**
```json
{
  "username": "newuser",
  "password": "123456",
  "name": "新用户",
  "email": "user@example.com",
  "role": "user"
}
```

---

### 8. 启用/禁用用户（管理员）
```
PUT /auth/users/:id/toggle
```
- **权限**：仅管理员
- **认证**：Bearer Token
- **参数**：`:id` - 用户 ID

---

## 收入管理 (/income)

### 9. 获取收入列表
```
GET /income
```
- **权限**：需登录
- **认证**：Bearer Token

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 (YYYY-MM-DD) |
| endDate | string | 结束日期 (YYYY-MM-DD) |
| categoryId | number | 分类 ID |
| accountId | number | 账户 ID |

---

### 10. 获取单个收入记录
```
GET /income/:id
```
- **权限**：需登录
- **认证**：Bearer Token

---

### 11. 创建收入记录
```
POST /income
```
- **权限**：需登录
- **认证**：Bearer Token

**请求体：**
```json
{
  "date": "2026-03-31",
  "amount": 5000,
  "categoryId": 1,
  "accountId": 1,
  "description": "工资"
}
```

---

### 12. 更新收入记录
```
PUT /income/:id
```
- **权限**：需登录
- **认证**：Bearer Token

**请求体：**
```json
{
  "date": "2026-03-31",
  "amount": 6000,
  "categoryId": 1,
  "accountId": 1,
  "description": "工资（调整）"
}
```

---

### 13. 删除收入记录
```
DELETE /income/:id
```
- **权限**：需登录
- **认证**：Bearer Token

---

## 支出管理 (/expense)

### 14. 获取支出列表
```
GET /expense
```
- **权限**：需登录
- **认证**：Bearer Token

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| categoryId | number | 分类 ID |
| accountId | number | 账户 ID |

---

### 15. 获取单个支出记录
```
GET /expense/:id
```
- **权限**：需登录
- **认证**：Bearer Token

---

### 16. 创建支出记录
```
POST /expense
```
- **权限**：需登录
- **认证**：Bearer Token

**请求体：**
```json
{
  "date": "2026-03-31",
  "amount": 50,
  "categoryId": 2,
  "accountId": 1,
  "description": "午餐"
}
```

---

### 17. 更新支出记录
```
PUT /expense/:id
```
- **权限**：需登录
- **认证**：Bearer Token

---

### 18. 删除支出记录
```
DELETE /expense/:id
```
- **权限**：需登录
- **认证**：Bearer Token

---

## 分类管理 (/categories)

### 19. 获取分类列表
```
GET /categories
```

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 分类类型 (`income` / `expense`) |

---

### 20. 创建分类
```
POST /categories
```

**请求体：**
```json
{
  "name": "餐饮",
  "type": "expense"
}
```

---

### 21. 更新分类
```
PUT /categories/:id
```

---

### 22. 删除分类
```
DELETE /categories/:id
```

---

## 账户管理 (/accounts)

### 23. 获取账户列表
```
GET /accounts
```

---

### 24. 获取单个账户
```
GET /accounts/:id
```

---

### 25. 创建账户
```
POST /accounts
```

**请求体：**
```json
{
  "name": "现金",
  "type": "cash"
}
```

**账户类型：** `cash` | `bank` | `alipay` | `wechat`

---

### 26. 更新账户
```
PUT /accounts/:id
```

---

### 27. 删除账户
```
DELETE /accounts/:id
```

---

## 报表接口 (/reports)

### 28. 月度报表
```
GET /reports/monthly
```

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| year | number | 年份 |
| month | number | 月份 (1-12) |

---

### 29. 季度报表
```
GET /reports/quarterly
```

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| year | number | 年份 |
| quarter | number | 季度 (1-4) |

---

### 30. 年度报表
```
GET /reports/yearly
```

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| year | number | 年份 |

---

### 31. 仪表盘数据
```
GET /reports/dashboard
```

**响应说明：**
- 当前账户总余额
- 本月收入/支出总计
- 本年累计收入/支出
- 近期收支趋势

---

## 数据导出 (/export)

### 32. 导出收入数据
```
GET /export/income
```
- **响应类型**：Blob (Excel 文件)

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |

---

### 33. 导出支出数据
```
GET /export/expense
```
- **响应类型**：Blob (Excel 文件)

---

### 34. 导出月度报表
```
GET /export/monthly
```
- **响应类型**：Blob (Excel 文件)

---

### 35. 导出年度报表
```
GET /export/yearly
```
- **响应类型**：Blob (Excel 文件)

---

## 操作日志 (/logs)

### 36. 获取日志列表（管理员）
```
GET /logs
```
- **权限**：仅管理员
- **认证**：Bearer Token

**查询参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| userId | number | 用户 ID |
| action | string | 操作类型 (CREATE/UPDATE/DELETE/LOGIN/LOGOUT) |
| resource | string | 资源类型 (income/expense/user/category/account) |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| page | number | 页码 (默认 1) |
| pageSize | number | 每页条数 (默认 20) |

**响应：**
```json
{
  "logs": [
    {
      "id": 1,
      "userId": 1,
      "username": "admin",
      "action": "CREATE",
      "resource": "income",
      "resourceId": 1,
      "oldValue": null,
      "newValue": {...},
      "description": "创建收入记录 #1",
      "ip": "::1",
      "createdAt": "2026-03-31T14:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

---

### 37. 获取日志统计（管理员）
```
GET /logs/stats
```
- **权限**：仅管理员
- **认证**：Bearer Token

**响应：**
```json
{
  "LOGIN": 50,
  "CREATE": 30,
  "UPDATE": 20,
  "DELETE": 5,
  "LOGOUT": 45
}
```

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user | user123 |

---

_本文档随项目持续更新_