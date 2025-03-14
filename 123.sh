#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

echo -e "${YELLOW}开始部署DanceCat应用...${NC}"

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker未安装，正在安装Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker安装完成！${NC}"
    # 需要重新登录以应用组更改
    echo -e "${YELLOW}请重新登录终端后再次运行此脚本${NC}"
    exit 1
fi

# 检查Docker Compose是否已安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose未安装，正在安装Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose安装完成！${NC}"
fi

# 创建项目目录
PROJECT_DIR="dancecat"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}项目目录已存在，正在更新...${NC}"
    cd $PROJECT_DIR
    git pull
else
    echo -e "${YELLOW}正在克隆仓库...${NC}"
    git clone https://github.com/lluciien/dancecat.git
    cd $PROJECT_DIR
fi

# 创建Dockerfile
echo -e "${YELLOW}创建Dockerfile...${NC}"
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 修改next.config.mjs以支持standalone输出
RUN sed -i 's/output: .*/output: "standalone",/' next.config.mjs || echo 'output: "standalone",' >> next.config.mjs

RUN npm run build

# 生产环境
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

# 创建docker-compose.yml
echo -e "${YELLOW}创建docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3'

services:
  dancecat:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    restart: always
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

# 构建并启动Docker容器
echo -e "${YELLOW}构建并启动Docker容器...${NC}"
docker-compose up -d --build

# 检查容器是否成功启动
if [ $? -eq 0 ]; then
    echo -e "${GREEN}部署成功！${NC}"
    echo -e "${GREEN}应用现在运行在 http://localhost:3000${NC}"
else
    echo -e "${YELLOW}部署过程中出现错误，请检查日志${NC}"
    docker-compose logs
fi

# 显示如何查看日志和停止应用的说明
echo -e "\n${YELLOW}有用的命令:${NC}"
echo -e "  查看日志: ${GREEN}cd $PROJECT_DIR && docker-compose logs -f${NC}"
echo -e "  停止应用: ${GREEN}cd $PROJECT_DIR && docker-compose down${NC}"
echo -e "  重启应用: ${GREEN}cd $PROJECT_DIR && docker-compose restart${NC}"
