# Inkflow Website

Inkflow 是一个前后端分离的内容社区项目（博客平台方向），支持用户注册登录、文章发布与编辑、评论互动、点赞收藏、个人主页与社区推荐等核心能力。项目采用 **React + Vite + TypeScript** 构建客户端，使用 **Node.js + Express + MongoDB + TypeScript** 构建服务端，适合作为中大型前端/全栈练习项目。

## 项目介绍

### 核心能力

- 用户系统：注册、登录、鉴权、获取当前用户信息。
- 内容系统：文章列表、文章详情、创建/编辑/删除文章。
- 互动系统：评论、评论点赞、文章点赞/收藏。
- 个人与社交：个人资料、关注关系、个人文章与收藏列表。
- 发现能力：搜索、社区标签建议、仪表盘（overview/social/history/notifications）。
- 媒体能力：图片上传（Cloudinary）。

### 技术栈

**Client（`/client`）**
- React 19 + TypeScript
- Vite 8
- Redux Toolkit
- TanStack Query
- React Router
- Tailwind CSS 4
- Axios + Zod

**Server（`/server`）**
- Node.js + Express 5 + TypeScript
- MongoDB + Mongoose
- JWT 鉴权
- Zod 参数校验
- Multer + Cloudinary 上传

## 目录结构

```text
Inkflow_Website/
├─ client/         # 前端应用（Vite + React）
├─ server/         # 后端 API（Express + MongoDB）
├─ DESIGN.md       # 设计规范文档
└─ README.md
```

## 运行指南

### 1) 环境要求

- Node.js 18+（建议 Node.js 20 LTS）
- npm 9+
- MongoDB（本地或云服务）

### 2) 克隆并安装依赖

在仓库根目录执行：

```bash
# 安装前端依赖
cd client && npm install

# 安装后端依赖
cd ../server && npm install
```

### 3) 配置后端环境变量

在 `server/` 目录创建 `.env.local`（开发环境推荐）或 `.env`，示例：

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/inkflow

# Auth
JWT_SECRET=replace-with-your-secret
JWT_EXPIRES_IN=7d

# CORS（可配置多个，用逗号分隔）
CLIENT_URL=http://localhost:5173

# Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Embedding / 社区推荐相关（按需）
# OPENAI_API_KEY=
# OPENAI_EMBEDDING_MODEL=text-embedding-3-small
# DASHSCOPE_API_KEY=
# DASHSCOPE_EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# DASHSCOPE_EMBEDDING_MODEL=text-embedding-v4
# EMBEDDING_DIMENSIONS=1024
```

> 注意：`MONGO_URI`、`JWT_SECRET` 为必填；`CLIENT_URL` 支持多个地址（逗号分隔）。

### 4) 启动后端

在 `server/` 目录执行：

```bash
npm run dev
```

默认会启动在 `http://localhost:5000`。

### 5) 启动前端

新开一个终端，在 `client/` 目录执行：

```bash
npm run dev
```

默认会启动在 `http://localhost:5173`。

前端开发模式下已配置 Vite 代理：`/api` 会转发到 `http://localhost:5000`。

### 6) 生产构建（可选）

```bash
# client
cd client && npm run build

# server
cd ../server && npm run build
npm run start
```

## 常用脚本

### Client

- `npm run dev`：启动开发服务器
- `npm run build`：类型检查 + 构建
- `npm run lint`：ESLint 检查
- `npm run preview`：本地预览构建产物

### Server

- `npm run dev`：ts-node-dev 热更新开发
- `npm run build`：TypeScript 编译
- `npm run start`：运行编译后的服务

## API 基础路径

后端统一挂载在：

```text
/api/v1
```

例如：
- 鉴权：`/api/v1/auth/*`
- 文章：`/api/v1/articles/*`
- 评论：`/api/v1/articles/:slug/comments/*`

## 致谢

这个项目最初用于前端与工程化能力练习，目前已扩展为完整的全栈内容平台模板。欢迎在此基础上继续迭代功能（如通知推送、全文检索优化、部署脚本、测试体系等）。
