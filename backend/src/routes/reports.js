const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// 辅助函数：获取日期范围
function getDateRange(year, month, quarter) {
  if (month) {
    // 月度
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return { start, end, label: `${year}年${month}月` };
  } else if (quarter) {
    // 季度
    const startMonth = (quarter - 1) * 3;
    const endMonth = quarter * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, endMonth, 0, 23, 59, 59);
    return { start, end, label: `${year}年第${quarter}季度` };
  } else {
    // 年度
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    return { start, end, label: `${year}年` };
  }
}

// 月度报表
router.get('/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const { start, end, label } = getDateRange(parseInt(year), parseInt(month));

    // 收入统计
    const incomeData = await prisma.income.groupBy({
      by: ['categoryId'],
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    // 支出统计
    const expenseData = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    // 获取分类详情
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

    res.json({
      success: true,
      data: {
        period: label,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomeByCategory,
        expenseByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 季度报表
router.get('/quarterly', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), quarter } = req.query;
    
    let quarters = quarter ? [parseInt(quarter)] : [1, 2, 3, 4];
    const results = [];

    for (const q of quarters) {
      const { start, end, label } = getDateRange(parseInt(year), null, q);

      const incomeAgg = await prisma.income.aggregate({
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          amount: true
        }
      });

      const expenseAgg = await prisma.expense.aggregate({
        where: {
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: {
          amount: true
        }
      });

      const totalIncome = parseFloat(incomeAgg._sum.amount || 0);
      const totalExpense = parseFloat(expenseAgg._sum.amount || 0);

      results.push({
        quarter: q,
        period: label,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
    }

    res.json({
      success: true,
      data: quarter ? results[0] : results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 年度报表
router.get('/yearly', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const { start, end, label } = getDateRange(parseInt(year));

    // 年度汇总
    const incomeAgg = await prisma.income.aggregate({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    const expenseAgg = await prisma.expense.aggregate({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    // 月度明细
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);

      const monthIncome = await prisma.income.aggregate({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true }
      });

      const monthExpense = await prisma.expense.aggregate({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        },
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
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: { amount: true }
    });

    const expenseByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: { amount: true }
    });

    const categories = await prisma.category.findMany();

    const totalIncome = parseFloat(incomeAgg._sum.amount || 0);
    const totalExpense = parseFloat(expenseAgg._sum.amount || 0);

    res.json({
      success: true,
      data: {
        period: label,
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
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 仪表盘数据
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // 本月统计
    const monthIncome = await prisma.income.aggregate({
      where: {
        date: {
          gte: thisMonthStart,
          lte: thisMonthEnd
        }
      },
      _sum: { amount: true }
    });

    const monthExpense = await prisma.expense.aggregate({
      where: {
        date: {
          gte: thisMonthStart,
          lte: thisMonthEnd
        }
      },
      _sum: { amount: true }
    });

    // 账户余额
    const accounts = await prisma.account.findMany();
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

    // 最近交易
    const recentIncomes = await prisma.income.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true }
    });

    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { category: true }
    });

    res.json({
      success: true,
      data: {
        monthIncome: parseFloat(monthIncome._sum.amount || 0),
        monthExpense: parseFloat(monthExpense._sum.amount || 0),
        monthBalance: parseFloat(monthIncome._sum.amount || 0) - parseFloat(monthExpense._sum.amount || 0),
        totalBalance,
        accounts,
        recentTransactions: {
          incomes: recentIncomes,
          expenses: recentExpenses
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;