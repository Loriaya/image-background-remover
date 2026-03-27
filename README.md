# Image Background Remover

使用 Cloudflare Workers 搭建的图片背景移除工具。

## 功能

- 上传图片，自动移除背景
- 支持 JPG/PNG
- 免费托管在 Cloudflare Workers

## 部署

1. 安装 wrangler: `npm install -g wrangler`
2. 登录: `wrangler login`
3. 设置 API Key: `wrangler secret put REMOVE_BG_API_KEY`
4. 部署: `wrangler deploy`

## API Key

在 [remove.bg](https://www.remove.bg/api) 注册获取免费 API Key，每月 150 次免费额度。

## 许可证

MIT
