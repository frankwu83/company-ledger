const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建默认分类
  const incomeCategories = [
    { name: '销售收入', type: 'income' },
    { name: '服务收入', type: 'income' },
    { name: '投资收益', type: 'income' },
    { name: '其他收入', type: 'income' }
  ]

  const expenseCategories = [
    { name: '办公费用', type: 'expense' },
    { name: '人力成本', type: 'expense' },
    { name: '市场推广', type: 'expense' },
    { name: '差旅费用', type: 'expense' },
    { name: '设备采购', type: 'expense' },
    { name: '其他支出', type: 'expense' }
  ]

  for (const cat of incomeCategories) {
    await prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: cat
    })
  }

  for (const cat of expenseCategories) {
    await prisma.category.create({
      data: cat
    })
  }

  console.log('分类数据创建完成')

  // 创建默认账户
  const accounts = [
    { name: '现金', type: 'cash', balance: 0 },
    { name: '银行账户', type: 'bank', balance: 0 },
    { name: '支付宝', type: 'alipay', balance: 0 },
    { name: '微信支付', type: 'wechat', balance: 0 }
  ]

  for (const acc of accounts) {
    await prisma.account.create({
      data: acc
    })
  }

  console.log('账户数据创建完成')
  console.log('数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })