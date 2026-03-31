const express = require('express');
const router = express.Router();
const userService = require('../services/user');
const operationLogService = require('../services/operationLog');
const { auth, adminOnly } = require('../middleware/auth');

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    const result = await userService.login(username, password);
    
    // 记录登录日志
    if (result.user) {
      await operationLogService.createLog({
        userId: result.user.id,
        username: result.user.username,
        action: 'LOGIN',
        resource: 'user',
        resourceId: result.user.id,
        description: '用户登录',
        ip: req.ip || req.connection?.remoteAddress
      });
    }
    
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// 用户登出
router.post('/logout', auth, async (req, res) => {
  try {
    // 记录登出日志
    await operationLogService.createLog({
      userId: req.user.id,
      username: req.user.username,
      action: 'LOGOUT',
      resource: 'user',
      resourceId: req.user.id,
      description: '用户登出',
      ip: req.ip || req.connection?.remoteAddress
    });
    
    res.json({ message: '登出成功' });
  } catch (error) {
    res.status(500).json({ error: '登出失败' });
  }
});

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// 更新当前用户信息
router.put('/me', auth, async (req, res) => {
  try {
    const oldUser = await userService.getUserById(req.user.userId);
    const user = await userService.updateUser(req.user.userId, req.body);
    
    // 记录更新日志
    await operationLogService.createLog({
      userId: req.user.id,
      username: req.user.username,
      action: 'UPDATE',
      resource: 'user',
      resourceId: req.user.userId,
      oldValue: oldUser,
      newValue: user,
      description: '更新个人信息',
      ip: req.ip || req.connection?.remoteAddress
    });
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 修改密码
router.put('/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '请输入原密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少6位' });
    }

    await userService.changePassword(req.user.userId, oldPassword, newPassword);
    
    // 记录密码修改日志
    await operationLogService.createLog({
      userId: req.user.id,
      username: req.user.username,
      action: 'UPDATE',
      resource: 'user',
      resourceId: req.user.userId,
      description: '修改密码',
      ip: req.ip || req.connection?.remoteAddress
    });
    
    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 创建用户（管理员）
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    const user = await userService.createUser({ username, password, name, email, role });
    
    // 记录创建用户日志
    await operationLogService.createLog({
      userId: req.user.id,
      username: req.user.username,
      action: 'CREATE',
      resource: 'user',
      resourceId: user.id,
      newValue: user,
      description: `创建用户: ${username}`,
      ip: req.ip || req.connection?.remoteAddress
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 获取所有用户（管理员）
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 禁用/启用用户（管理员）
router.put('/users/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    const oldUser = await userService.getUserById(parseInt(req.params.id));
    const user = await userService.toggleUserStatus(parseInt(req.params.id));
    
    // 记录用户状态变更日志
    await operationLogService.createLog({
      userId: req.user.id,
      username: req.user.username,
      action: 'UPDATE',
      resource: 'user',
      resourceId: user.id,
      oldValue: oldUser,
      newValue: user,
      description: `${user.isActive ? '启用' : '禁用'}用户: ${user.username}`,
      ip: req.ip || req.connection?.remoteAddress
    });
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;