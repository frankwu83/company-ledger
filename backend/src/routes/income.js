const express = require('express');
const prisma = require('../prisma');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { logOperation } = require('../middleware/logger');
const operationLogService = require('../services/operationLog');

// 获取所有收入记录
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, categoryId, accountId } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (accountId) where.accountId = parseInt(accountId);

    const incomes = await prisma.income.findMany({
      where,
      include: {
        category: true,
        account: true
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个收入记录
router.get('/:id', auth, async (req, res) => {
  try {
    const income = await prisma.income.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        account: true
      }
    });
    
    if (!income) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }
    
    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建收入记录 - 使用日志中间件
router.post('/', auth, logOperation('CREATE', 'income'), async (req, res) => {
  try {
    const { date, amount, categoryId, accountId, description } = req.body;
    
    const income = await prisma.income.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        categoryId: parseInt(categoryId),
        accountId: parseInt(accountId),
        description
      },
      include: {
        category: true,
        account: true
      }
    });

    // 更新账户余额
    await prisma.account.update({
      where: { id: parseInt(accountId) },
      data: {
        balance: {
          increment: parseFloat(amount)
        }
      }
    });

    res.status(201).json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新收入记录
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, amount, categoryId, accountId, description } = req.body;
    const id = parseInt(req.params.id);

    // 获取原记录
    const oldIncome = await prisma.income.findUnique({
      where: { id }
    });

    if (!oldIncome) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }

    // 更新记录
    const income = await prisma.income.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        accountId: accountId ? parseInt(accountId) : undefined,
        description
      },
      include: {
        category: true,
        account: true
      }
    });

    // 如果金额变化，更新账户余额
    if (amount && parseFloat(amount) !== parseFloat(oldIncome.amount)) {
      const diff = parseFloat(amount) - parseFloat(oldIncome.amount);
      await prisma.account.update({
        where: { id: parseInt(accountId || oldIncome.accountId) },
        data: {
          balance: {
            increment: diff
          }
        }
      });
    }

    // 记录更新日志
    if (req.user) {
      await operationLogService.createLog({
        userId: req.user.id,
        username: req.user.username,
        action: 'UPDATE',
        resource: 'income',
        resourceId: id,
        oldValue: oldIncome,
        newValue: income,
        description: `更新收入记录 #${id}`,
        ip: req.ip || req.connection?.remoteAddress
      });
    }

    res.json({ success: true, data: income });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除收入记录
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const income = await prisma.income.findUnique({
      where: { id }
    });

    if (!income) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }

    // 扣除账户余额
    await prisma.account.update({
      where: { id: income.accountId },
      data: {
        balance: {
          decrement: parseFloat(income.amount)
        }
      }
    });

    await prisma.income.delete({
      where: { id }
    });

    // 记录删除日志
    if (req.user) {
      await operationLogService.createLog({
        userId: req.user.id,
        username: req.user.username,
        action: 'DELETE',
        resource: 'income',
        resourceId: id,
        oldValue: income,
        description: `删除收入记录 #${id}`,
        ip: req.ip || req.connection?.remoteAddress
      });
    }

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;