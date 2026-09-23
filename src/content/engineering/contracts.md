---
title: 接口契约
description: 浏览器写回、Git 平台与角色约定（无自建后端）
order: 3
---

RD 维护。本工程是 **纯前端**：没有自建服务、没有自有 REST / gRPC。本页只写浏览器与外部平台怎么对接，不认聊天里的临时约定。

改写回、推送、角色校验时先改本页，再改代码，并通知 FE / QA。

## 工程形态

| 项 | 约定 |
| --- | --- |
| 运行 | Vite 开发 / 静态 `dist/`，History 路由回退 `index.html` |
| 自建后端 | **没有**。不要加业务 API 服务 |
| 数据 | Markdown 在仓库 `src/content/`；当前角色在 `src/config/workspace-roles.json`；主题等偏好在 localStorage；目录句柄在 IndexedDB |
| 鉴权 | 配置中心勾选七个角色并写回 JSON，不是登录账号 |

## 浏览器写回

| 能力 | 约定 |
| --- | --- |
| 前提 | Chrome / Edge；已授权含 `src/content` 的项目根目录 |
| 保存文档 | 有角色权限才写 `src/content/**/*.md` |
| 图片 | 写入该文档目录 `assets/`，正文用相对路径 |
| 未授权 | 可预览，不能落盘 |
| 失败提示 | 引导去配置中心重新授权，不假装已保存 |

## Git 平台（可选推送）

绑定代码空间后，浏览器提交并推送到 GitHub / Gitee / GitLab。令牌只存在本机 `.agi-workspace.local.json`，禁止进仓库。

| 项 | 约定 |
| --- | --- |
| 本地 dev | Vite 把 `/__git/*`、`/__git-remote/*` 转到平台，避开跨域 |
| 静态托管 | 无上述代理，直连平台；跨域失败则用 `npm run dev` 再推 |
| 范围 | 按 `.gitignore` 整仓 commit / push |
| 本阶段不做 | 应用内 pull、冲突合并 |

平台官方文档以各家令牌页为准，不在本仓库再实现一套 Git 服务。

## 角色与可写范围

以 [项目角色](/project/roles) 和 `src/lib/roles.ts` 为准。开始阅读（含首页）与 `space/`：任意已选角色可改。其它目录按角色并集。首页文件不可删。

## 不要写进本页的

- 业务 REST 路径、数据库表、微服务一览
- 登录、Cookie、网关、服务端错误码
