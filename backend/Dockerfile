FROM node:24.14.1-alpine AS dev

# 设置容器内的工作目录为 /app
# 和yaml中挂载目录中的 /app 是一样的，所以那边挂载在哪里，这边也需要设置成相同的，表示容器中的一个目录
WORKDIR /app

# COPY 是镜像构建时发生的，volumes 挂载是容器启动时才发生的，所以是先 COPY ，后挂载
# 如果不先 COPY，那构建镜像的时候 /app/package.json 这些文件还不存在，npm install 就没法跑
# 把宿主机当前构建上下文里的 package.json 和 package-lock.json 复制到容器当前目录 /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

# npm 会先看 /app/package.json，也就是根目录这个文件
# 然后会发现两个子项目，然后在分别安装两个子项目的依赖包
RUN npm install

# 容器默认启动时执行 backend workspace 的开发命令
CMD ["npm", "run", "dev", "--workspace", "backend"]




FROM node:24.14.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN npm install

COPY backend ./backend

RUN npm run build --workspace backend




FROM node:24.14.1-alpine AS prod

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

# 只为 backend 这个 workspace 安装生产依赖，并忽略开发依赖
# --omit=dev 不安装 devDependencies
# 也就是不装开发环境才需要的包，比如：TypeScript eslint concurrently 测试工具 构建工具
RUN npm install --omit=dev --workspace backend

# prod依赖于build这个阶段的产出，所以会调用上面build的过程
# /app/backend/dist 和 ./backend/dist，其实目录是一样的，但是是两个容器的目录，前者是 build阶段 容器的目录，容器是不一样的
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/.env.example ./backend/.env.example

# 声明这个容器里的应用通常会监听 3000 端口
# 注意它不是“真正开放端口”，它更像是元信息，告诉别人，这个镜像设计上是跑在 3000 端口上的
EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "backend"]
