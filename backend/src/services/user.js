const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 创建用户
async function createUser(data) {
  const { username, password, name, email, role } = data;
  
  // 检查用户名是否已存在
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw new Error('用户名已存在');
  }

  // 检查邮箱是否已存在
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new Error('邮箱已被使用');
    }
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name: name || username,
      email,
      role: role || 'user'
    }
  });

  return { ...user, password: undefined };
}

// 用户登录
async function login(username, password) {
  const user = await prisma.user.findUnique({ where: { username } });
  
  if (!user) {
    throw new Error('用户名或密码错误');
  }

  if (!user.isActive) {
    throw new Error('账户已被禁用');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('用户名或密码错误');
  }

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // 生成 token
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

// 获取用户信息
async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return { ...user, password: undefined };
}

// 更新用户信息
async function updateUser(userId, data) {
  const { name, email } = data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email }
  });

  return { ...user, password: undefined };
}

// 修改密码
async function changePassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new Error('原密码错误');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return true;
}

// 获取所有用户（管理员）
async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return users.map(user => ({ ...user, password: undefined }));
}

// 禁用/启用用户（管理员）
async function toggleUserStatus(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('用户不存在');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive }
  });

  return { ...updated, password: undefined };
}

// 验证 token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  createUser,
  login,
  getUserById,
  updateUser,
  changePassword,
  getAllUsers,
  toggleUserStatus,
  verifyToken
};
