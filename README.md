# AtomicServer

一个前后端分离的 Node.js 项目模板：

- 前端：Vue 3 + Vite
- 后端：Express + TypeScript
- 缓存：Redis
- Node.js：24.14.1
- Docker 基础镜像：`node:24.14.1-alpine`
- 前端地址：`http://127.0.0.1:5173`
- 后端地址：`http://127.0.0.1:3000`
- 开发环境：代码挂载进容器，容器内执行 `npm run dev`
- 生产环境：代码直接打进镜像，服务器执行 `docker compose up -d --build`

## 目录结构

```text
.
├── backend
├── frontend
├── .node-version
├── .nvmrc
└── package.json
```

## 启动方式

1. 切换到 Node.js 24.14.1。
2. 在根目录执行 `npm install`。
3. 在根目录执行 `npm run dev`。

## Docker 开发

开发环境会把代码挂载进容器，适合实时看日志、进容器排查和断点调试。

1. 启动开发环境：

```bash
docker compose -f compose.dev.yaml up --build
```

2. 查看日志：

```bash
docker compose -f compose.dev.yaml logs -f frontend backend
```

3. 进入后端容器：

```bash
docker compose -f compose.dev.yaml exec backend sh
```

4. 断点调试后端：

- 已暴露调试端口 `9229`
- 可直接使用 [.vscode/launch.json](/Users/niko/Desktop/AtomicServer/.vscode/launch.json) 里的 `Attach Backend in Docker`
- Redis 默认暴露 `6379` 端口，后端通过 `redis://redis:6379` 访问

## Docker 生产

生产环境不会挂载代码，镜像构建时会把代码直接打进去。

```bash
docker compose up -d --build
```

默认对外暴露前端 `80` 端口，后端只在容器网络内提供给前端反向代理使用。

## 接口示例

- 后端健康检查：`GET http://127.0.0.1:3000/api/health`
- Redis 连通性测试：`GET http://127.0.0.1:3000/api/redis/test`
- 前端开发环境通过 Vite 代理访问：`GET /api/health`
