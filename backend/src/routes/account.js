const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// 获取所有账户
router.get('/', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { id: 'asc' }
    });

    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个账户
router.get('/:id', async (req, res) => {
  try {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!account) {
      return res.status(404).json({ success: false, error: '账户不存在' });
    }
    
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建账户
router.post('/', async (req, res) => {
  try {
    const { name, type, balance = 0 } = req.body;
    
    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseFloat(balance)
      }
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新账户
router.put('/:id', async (req, res) => {
  try {
    const { name, balance } = req.body;
    const id = parseInt(req.params.id);

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        balance: balance !== undefined ? parseFloat(balance) : undefined
      }
    });

    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除账户
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.account.delete({
      where: { id }
    });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;