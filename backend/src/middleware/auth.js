const userService = require('../services/user');

// 认证中间件
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = userService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  req.user = decoded;
  // 同时提供 id 字段（兼容代码中使用 id 的地方）
  if (!req.user.id) {
    req.user.id = decoded.userId;
  }
  next();
}

// 管理员权限中间件
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}

// 可选认证（有 token 则解析，无 token 也能访问）
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = userService.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
}

module.exports = { auth, adminOnly, optionalAuth };
