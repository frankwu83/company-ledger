#!/bin/bash

echo "🚀 公司台账系统 - 安装脚本"
echo "=============================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装根目录依赖
echo ""
echo "📦 安装根目录依赖..."
npm install

# 安装后端依赖
echo ""
echo "📦 安装后端依赖..."
cd backend
npm install

# 初始化数据库
echo ""
echo "🗄️  初始化数据库..."
npx prisma generate
npx prisma migrate dev --name init

# 填充测试数据
echo ""
echo "🌱 填充测试数据..."
node ../database/seed.js

cd ..

# 安装前端依赖
echo ""
echo "📦 安装前端依赖..."
cd frontend
npm install

cd ..

echo ""
echo "=============================="
echo "✅ 安装完成！"
echo ""
echo "启动开发服务器:"
echo "  npm run dev"
echo ""
echo "或者分别启动:"
echo "  npm run dev:backend  # 后端 http://localhost:3000"
echo "  npm run dev:frontend # 前端 http://localhost:5173"
echo "=============================="