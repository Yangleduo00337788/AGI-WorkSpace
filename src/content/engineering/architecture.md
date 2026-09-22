---
title: 技术架构
description: 技术栈、模块划分、数据流与质量属性
order: 1
---

RD 维护。改栈、改模块边界先改本页，再改代码。

## 技术栈

| 层 | 本模版默认 | 当前项目（替换） |
| --- | --- | --- |
| 界面 | Vue 3 + TypeScript + Vite |  |
| 样式 | Tailwind CSS + shadcn-vue |  |
| 内容 | `src/content/` Markdown |  |
| 服务端 | 无（纯静态） |  |
| 数据 | 浏览器偏好 + 本地目录授权写回 MD |  |
| 鉴权 | 角色勾选（本机） |  |

## 模块

```text
src/content/           项目知识（角色文档都在这里）
src/lib/content.ts     扫描 MD、生成导航
src/lib/markdown.ts    渲染
src/lib/roles.ts       七个角色与可写范围
src/lib/workspace-fs.ts 授权目录并写回文件
src/views/DocView.vue  通用文档页（不要为每篇 MD 新建 Vue 页）
```

## 数据流

1. 作者在 `src/content/` 写 Markdown（或在预览里编辑后写回文件）
2. 开发 / 构建时 glob 收集并解析 frontmatter
3. 导航树、搜索、上一篇 / 下一篇共用同一份文档列表
4. 保存时：校验角色范围 → 写入本地 `src/content/*.md`

## 质量属性

| 项 | 目标 | 不追求 |
| --- | --- | --- |
| 性能 | 文档页可静态打开 |  |
| 安全 | 授权只存在本机浏览器 |  |
| 可维护 | 新增知识 = 新增 `.md` | 为每篇文档加路由组件 |
| 可用 | Chrome / Edge 目录授权后可写回 | 全浏览器文件写入 |

## 外部依赖

| 系统 | 用途 | 负责人 | 文档 |
| --- | --- | --- | --- |
|  |  |  |  |
