const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// 获取所有支出记录
router.get('/', async (req, res) => {
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

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        account: true
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个支出记录
router.get('/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        account: true
      }
    });
    
    if (!expense) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }
    
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建支出记录
router.post('/', async (req, res) => {
  try {
    const { date, amount, categoryId, accountId, description } = req.body;
    
    const expense = await prisma.expense.create({
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

    // 扣除账户余额
    await prisma.account.update({
      where: { id: parseInt(accountId) },
      data: {
        balance: {
          decrement: parseFloat(amount)
        }
      }
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新支出记录
router.put('/:id', async (req, res) => {
  try {
    const { date, amount, categoryId, accountId, description } = req.body;
    const id = parseInt(req.params.id);

    // 获取原记录
    const oldExpense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!oldExpense) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }

    // 更新记录
    const expense = await prisma.expense.update({
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
    if (amount && parseFloat(amount) !== parseFloat(oldExpense.amount)) {
      const diff = parseFloat(amount) - parseFloat(oldExpense.amount);
      await prisma.account.update({
        where: { id: parseInt(accountId || oldExpense.accountId) },
        data: {
          balance: {
            decrement: diff
          }
        }
      });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除支出记录
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return res.status(404).json({ success: false, error: '记录不存在' });
    }

    // 恢复账户余额
    await prisma.account.update({
      where: { id: expense.accountId },
      data: {
        balance: {
          increment: parseFloat(expense.amount)
        }
      }
    });

    await prisma.expense.delete({
      where: { id }
    });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;