# 构建阶段
FROM docker.tech-gym.fun/node:20.17.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 npm 配置文件
COPY .npmrc ./

# 首先只复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖，并添加缓存清理
RUN npm install \
    && npm cache clean --force

# 复制其他源代码
COPY . .

# 构建应用
RUN npm run build \
    && rm -rf node_modules

# 运行阶段
FROM docker.tech-gym.fun/nginx:alpine

# 安装 envsubst
RUN apk add --no-cache gettext

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件模板
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 创建启动脚本
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 设置默认环境变量
ENV API_URL=http://workout-api:8080

# 使用启动脚本
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 