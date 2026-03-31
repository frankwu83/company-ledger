const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const operationLogService = require('../services/operationLog');

/**
 * 获取操作日志列表（仅管理员）
 * GET /api/logs
 * query: userId, action, resource, startDate, endDate, page, pageSize
 */
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { userId, action, resource, startDate, endDate, page, pageSize } = req.query;

    const result = await operationLogService.getLogs({
      userId: userId ? parseInt(userId) : undefined,
      action,
      resource,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20
    });

    res.json(result);
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({ error: '获取操作日志失败' });
  }
});

/**
 * 获取日志统计（仅管理员）
 * GET /api/logs/stats
 */
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await operationLogService.getLogStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    res.json(stats);
  } catch (error) {
    console.error('获取日志统计失败:', error);
    res.status(500).json({ error: '获取日志统计失败' });
  }
});

module.exports = router;