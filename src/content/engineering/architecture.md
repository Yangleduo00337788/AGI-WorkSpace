---
title: 技术架构
description: 技术栈、模块划分、数据流与质量属性
order: 1
---

RD 维护。改栈、改模块边界先改本页，再改代码。

## 技术栈

| 层 | 本工程 |
| --- | --- |
| 形态 | 纯前端静态 SPA（Vite），无自建后端 |
| 界面 | Vue 3 + TypeScript + Vite |
| 样式 | Tailwind CSS + shadcn-vue |
| 内容 | `src/content/` Markdown |
| 数据 | 浏览器偏好 + 本地目录授权写回 MD |
| 鉴权 | 角色勾选（本机） |
| 远程（可选） | 浏览器推送到 Git 平台 |

## 模块

```text
src/content/              项目知识（角色文档都在这里）
src/lib/content.ts        解析 MD、生成导航（`catalog.docsNavTree` 排除 space）
src/lib/catalog-sync.ts   授权目录后按磁盘扫描并刷新侧栏
src/lib/markdown.ts       渲染
src/lib/roles.ts          七个角色与可写范围
src/lib/workspace-fs.ts   授权目录、写回 MD / 图片
src/lib/branding.ts       工作空间名称、口号、Logo
src/lib/git-sync.ts       按 .gitignore 整仓 commit/push
src/views/DocView.vue     通用文档页（不要为每篇 MD 新建 Vue 页）
src/views/SettingsView.vue 配置中心
```

## 数据流

1. 未授权时：构建打包的 `src/content/**/*.md` 作为初始目录
2. 授权工作目录后：扫描磁盘 Markdown，侧栏、搜索与磁盘一致
3. 预览里编辑 → 校验角色范围 → 写回本地文件；图片写入该文档下 `assets/`
4. 按角色可新建 / 删除 `.md`（根目录 `index.md` 除外）
5. 绑定代码空间后：按 `.gitignore` 提交并推送整个仓库

## 质量属性

| 项 | 目标 | 不追求 |
| --- | --- | --- |
| 性能 | 文档页可静态打开 |  |
| 安全 | 授权只存在本机浏览器 |  |
| 可维护 | 新增知识 = 新增 `.md` | 为每篇文档加路由组件 |
| 可用 | Chrome / Edge 目录授权后可写回 | 全浏览器文件写入 |

## 外部依赖

| 系统 | 用途 | 说明 |
| --- | --- | --- |
| Git 托管 | 可选提交推送 | GitHub / Gitee / GitLab，不是本仓库的服务 |
| 设计工具 | 稿件外链 | 交付说明写在设计文档 |
