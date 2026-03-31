const operationLogService = require('../services/operationLog');

/**
 * 日志记录中间件/工具函数
 * 包装 req 中的用户信息自动记录操作日志
 */
function logOperation(action, resource, resourceId) {
  return async (req, res, next) => {
    // 保存原始 send 方法
    const originalSend = res.send;
    
    res.send = function(body) {
      // 只有成功响应才记录日志
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        
        // 获取操作后的数据（如果有）
        const newValue = parsed.data || null;
        
        // 异步记录日志，不阻塞响应
        operationLogService.createLog({
          userId: req.user.id,
          username: req.user.username,
          action,
          resource,
          resourceId: resourceId || (req.params.id ? parseInt(req.params.id) : null),
          newValue,
          ip: req.ip || req.connection.remoteAddress
        }).catch(err => console.error('日志记录失败:', err));
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

module.exports = { logOperation };