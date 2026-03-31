const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 创建默认管理员账户
  const existingAdmin = await prisma.user.findUnique({ where: { username: 'admin' } });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        email: 'admin@example.com',
        role: 'admin'
      }
    });
    console.log('✅ 默认管理员账户已创建');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   ⚠️  请登录后立即修改密码！');
  } else {
    console.log('ℹ️  管理员账户已存在，跳过创建');
  }

  // 创建测试用户
  const existingUser = await prisma.user.findUnique({ where: { username: 'user' } });
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('user123', 10);
    await prisma.user.create({
      data: {
        username: 'user',
        password: hashedPassword,
        name: '测试用户',
        role: 'user'
      }
    });
    console.log('✅ 测试用户已创建 (user/user123)');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
