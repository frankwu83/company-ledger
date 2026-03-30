const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateTestData() {
  console.log('生成测试数据...')

  // 获取分类和账户
  const categories = await prisma.category.findMany()
  const accounts = await prisma.account.findMany()
  
  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  // 生成过去6个月的测试数据
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    
    console.log(`生成 ${month.getFullYear()}年${month.getMonth() + 1}月 的数据...`)
    
    // 生成收入记录（每月10-15条）
    const incomeCount = 10 + Math.floor(Math.random() * 6)
    for (let j = 0; j < incomeCount; j++) {
      const day = 1 + Math.floor(Math.random() * daysInMonth)
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
      const account = accounts[Math.floor(Math.random() * accounts.length)]
      const amount = 1000 + Math.floor(Math.random() * 9000) // 1000-10000
      
      await prisma.income.create({
        data: {
          date,
          amount,
          categoryId: category.id,
          accountId: account.id,
          description: `${category.name}收入`
        }
      })
    }
    
    // 生成支出记录（每月15-20条）
    const expenseCount = 15 + Math.floor(Math.random() * 6)
    for (let j = 0; j < expenseCount; j++) {
      const day = 1 + Math.floor(Math.random() * daysInMonth)
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
      const account = accounts[Math.floor(Math.random() * accounts.length)]
      const amount = 100 + Math.floor(Math.random() * 1900) // 100-2000
      
      await prisma.expense.create({
        data: {
          date,
          amount,
          categoryId: category.id,
          accountId: account.id,
          description: `${category.name}支出`
        }
      })
    }
  }

  console.log('✅ 测试数据生成完成！')
}

generateTestData()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })