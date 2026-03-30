const express = require('express');
const prisma = require('../prisma');
const ExportService = require('../services/exportService');
const router = express.Router();

// 导出收入记录
router.get('/income', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const incomes = await prisma.income.findMany({
      where,
      include: {
        category: true,
        account: true
      },
      orderBy: { date: 'desc' }
    });

    const wb = ExportService.exportIncome(incomes);
    const buffer = ExportService.download(wb, '收入记录');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=income.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 导出支出记录
router.get('/expense', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        account: true
      },
      orderBy: { date: 'desc' }
    });

    const wb = ExportService.exportExpense(expenses);
    const buffer = ExportService.download(wb, '支出记录');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=expense.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 导出月度报表
router.get('/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const reportYear = parseInt(year) || new Date().getFullYear();
    const reportMonth = parseInt(month) || new Date().getMonth() + 1;

    const start = new Date(reportYear, reportMonth - 1, 1);
    const end = new Date(reportYear, reportMonth, 0, 23, 59, 59);

    // 收入统计
    const incomeData = await prisma.income.groupBy({
      by: ['categoryId'],
      where: {
        date: { gte: start, lte: end }
      },
      _sum: { amount: true }
    });

    // 支出统计
    const expenseData = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        date: { gte: start, lte: end }
      },
      _sum: { amount: true }
    });

    const categories = await prisma.category.findMany();
    
    const incomeByCategory = incomeData.map(item => ({
      category: categories.find(c => c.id === item.categoryId)?.name || '未知',
      amount: parseFloat(item._sum.amount || 0)
    }));

    const expenseByCategory = expenseData.map(item => ({
      category: categories.find(c => c.id === item.categoryId)?.name || '未知',
      amount: parseFloat(item._sum.amount || 0)
    }));

    const totalIncome = incomeByCategory.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenseByCategory.reduce((sum, item) => sum + item.amount, 0);

    const report = {
      period: `${reportYear}年${reportMonth}月`,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory
    };

    const wb = ExportService.exportMonthlyReport(report);
    const buffer = ExportService.download(wb, `${reportYear}年${reportMonth}月报表`);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${reportYear}_${reportMonth}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 导出年度报表
router.get('/yearly', async (req, res) => {
  try {
    const { year } = req.query;
    const reportYear = parseInt(year) || new Date().getFullYear();

    const start = new Date(reportYear, 0, 1);
    const end = new Date(reportYear, 11, 31, 23, 59, 59);

    // 年度汇总
    const incomeAgg = await prisma.income.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    const expenseAgg = await prisma.expense.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    // 月度明细
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(reportYear, month - 1, 1);
      const monthEnd = new Date(reportYear, month, 0, 23, 59, 59);

      const monthIncome = await prisma.income.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });

      const monthExpense = await prisma.expense.aggregate({
        where: { date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });

      monthlyData.push({
        month,
        income: parseFloat(monthIncome._sum.amount || 0),
        expense: parseFloat(monthExpense._sum.amount || 0),
        balance: parseFloat(monthIncome._sum.amount || 0) - parseFloat(monthExpense._sum.amount || 0)
      });
    }

    // 分类统计
    const incomeByCategory = await prisma.income.groupBy({
      by: ['categoryId'],
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    const expenseByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true }
    });

    const categories = await prisma.category.findMany();

    const totalIncome = parseFloat(incomeAgg._sum.amount || 0);
    const totalExpense = parseFloat(expenseAgg._sum.amount || 0);

    const report = {
      period: `${reportYear}年`,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlyData,
      incomeByCategory: incomeByCategory.map(item => ({
        category: categories.find(c => c.id === item.categoryId)?.name || '未知',
        amount: parseFloat(item._sum.amount || 0)
      })),
      expenseByCategory: expenseByCategory.map(item => ({
        category: categories.find(c => c.id === item.categoryId)?.name || '未知',
        amount: parseFloat(item._sum.amount || 0)
      }))
    };

    const wb = ExportService.exportYearlyReport(report);
    const buffer = ExportService.download(wb, `${reportYear}年度报表`);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${reportYear}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;