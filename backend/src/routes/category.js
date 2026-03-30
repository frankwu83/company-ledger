const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const where = type ? { type } : {};
    
    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建分类
router.post('/', async (req, res) => {
  try {
    const { name, type, parentId } = req.body;
    
    const category = await prisma.category.create({
      data: {
        name,
        type,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const id = parseInt(req.params.id);

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        parentId: parentId ? parseInt(parentId) : null
      }
    });

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.category.delete({
      where: { id }
    });

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;