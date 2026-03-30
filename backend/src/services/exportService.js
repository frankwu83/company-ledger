const XLSX = require('xlsx');

class ExportService {
  // 导出收入记录
  static exportIncome(data, filename = '收入记录') {
    const exportData = data.map(item => ({
      '日期': new Date(item.date).toLocaleDateString('zh-CN'),
      '分类': item.category?.name || '',
      '账户': item.account?.name || '',
      '金额': parseFloat(item.amount),
      '说明': item.description || ''
    }));

    return this.exportToExcel(exportData, filename);
  }

  // 导出支出记录
  static exportExpense(data, filename = '支出记录') {
    const exportData = data.map(item => ({
      '日期': new Date(item.date).toLocaleDateString('zh-CN'),
      '分类': item.category?.name || '',
      '账户': item.account?.name || '',
      '金额': parseFloat(item.amount),
      '说明': item.description || ''
    }));

    return this.exportToExcel(exportData, filename);
  }

  // 导出月度报表
  static exportMonthlyReport(report, filename = '月度报表') {
    const summaryData = [{
      '项目': '总收入',
      '金额': report.totalIncome
    }, {
      '项目': '总支出',
      '金额': report.totalExpense
    }, {
      '项目': '结余',
      '金额': report.balance
    }];

    const incomeData = report.incomeByCategory.map(item => ({
      '类型': '收入',
      '分类': item.category,
      '金额': item.amount,
      '占比': ((item.amount / report.totalIncome) * 100).toFixed(2) + '%'
    }));

    const expenseData = report.expenseByCategory.map(item => ({
      '类型': '支出',
      '分类': item.category,
      '金额': item.amount,
      '占比': ((item.amount / report.totalExpense) * 100).toFixed(2) + '%'
    }));

    const wb = XLSX.utils.book_new();
    
    // 汇总表
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, '汇总');
    
    // 收入明细
    if (incomeData.length > 0) {
      const incomeWs = XLSX.utils.json_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(wb, incomeWs, '收入明细');
    }
    
    // 支出明细
    if (expenseData.length > 0) {
      const expenseWs = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(wb, expenseWs, '支出明细');
    }

    return wb;
  }

  // 导出年度报表
  static exportYearlyReport(report, filename = '年度报表') {
    const summaryData = [{
      '项目': '总收入',
      '金额': report.totalIncome
    }, {
      '项目': '总支出',
      '金额': report.totalExpense
    }, {
      '项目': '结余',
      '金额': report.balance
    }];

    const monthlyData = report.monthlyData.map(item => ({
      '月份': item.month + '月',
      '收入': item.income,
      '支出': item.expense,
      '结余': item.balance
    }));

    const incomeData = report.incomeByCategory.map(item => ({
      '类型': '收入',
      '分类': item.category,
      '金额': item.amount
    }));

    const expenseData = report.expenseByCategory.map(item => ({
      '类型': '支出',
      '分类': item.category,
      '金额': item.amount
    }));

    const wb = XLSX.utils.book_new();
    
    // 汇总表
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, '汇总');
    
    // 月度明细
    if (monthlyData.length > 0) {
      const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, monthlyWs, '月度明细');
    }
    
    // 收入明细
    if (incomeData.length > 0) {
      const incomeWs = XLSX.utils.json_to_sheet(incomeData);
      XLSX.utils.book_append_sheet(wb, incomeWs, '收入明细');
    }
    
    // 支出明细
    if (expenseData.length > 0) {
      const expenseWs = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(wb, expenseWs, '支出明细');
    }

    return wb;
  }

  // 通用导出方法
  static exportToExcel(data, filename) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return wb;
  }

  // 生成下载
  static download(wb, filename) {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    return wbout;
  }
}

module.exports = ExportService;