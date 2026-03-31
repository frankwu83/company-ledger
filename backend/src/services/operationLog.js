const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * 记录操作日志
 * @param {Object} params
 * @param {number} params.userId - 用户ID
 * @param {string} params.username - 用户名
 * @param {string} params.action - 操作类型: CREATE | UPDATE | DELETE | LOGIN | LOGOUT
 * @param {string} params.resource - 资源类型: income | expense | user | category | account
 * @param {number} [params.resourceId] - 资源ID
 * @param {Object} [params.oldValue] - 修改前的数据
 * @param {Object} [params.newValue] - 修改后的数据
 * @param {string} [params.description] - 操作描述
 * @param {string} [params.ip] - IP地址
 */
async function createLog({ userId, username, action, resource, resourceId, oldValue, newValue, description, ip }) {
  try {
    const log = await prisma.operationLog.create({
      data: {
        userId,
        username,
        action,
        resource,
        resourceId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        description,
        ip: ip || null
      }
    });
    return log;
  } catch (error) {
    console.error('创建操作日志失败:', error);
    // 日志记录失败不应影响主业务
    return null;
  }
}

/**
 * 获取操作日志列表
 * @param {Object} params
 * @param {number} [params.userId] - 筛选用户ID
 * @param {string} [params.action] - 筛选操作类型
 * @param {string} [params.resource] - 筛选资源类型
 * @param {Date} [params.startDate] - 开始日期
 * @param {Date} [params.endDate] - 结束日期
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页条数
 */
async function getLogs({ userId, action, resource, startDate, endDate, page = 1, pageSize = 20 }) {
  const where = {};

  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.operationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.operationLog.count({ where })
  ]);

  return {
    logs: logs.map(log => ({
      ...log,
      oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
      newValue: log.newValue ? JSON.parse(log.newValue) : null
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * 获取日志统计
 * @param {Date} [startDate]
 * @param {Date} [endDate]
 */
async function getLogStats(startDate, endDate) {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const result = await prisma.operationLog.groupBy({
    by: ['action'],
    where,
    _count: true
  });

  return result.reduce((acc, item) => {
    acc[item.action] = item._count;
    return acc;
  }, {});
}

module.exports = {
  createLog,
  getLogs,
  getLogStats
};