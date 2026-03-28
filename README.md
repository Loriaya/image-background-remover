# Image Background Remover

使用 Next.js + Tailwind CSS 搭建的图片背景移除工具。

## 功能

- 上传图片，自动移除背景
- 支持 JPG/PNG，最大 10MB
- 支持拖拽上传
- 自动下载处理结果

## 技术栈

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.local.example .env.local

# 添加你的 remove.bg API Key
# 编辑 .env.local 文件，添加：
# REMOVE_BG_API_KEY=你的API密钥

# 启动开发服务器
npm run dev
```

## 部署

### Cloudflare Pages（推荐）

1. 推送代码到 GitHub
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 GitHub 仓库
4. 添加环境变量：`REMOVE_BG_API_KEY`
5. 部署

### Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 在 Vercel 控制台添加环境变量：`REMOVE_BG_API_KEY`
4. 部署

### 环境变量

| 变量名 | 说明 |
|--------|------|
| REMOVE_BG_API_KEY | remove.bg API Key |

获取 API Key：https://www.remove.bg/api

免费版每月 150 次调用。

## 许可证

MIT
