---
title: AGI-WorkSpace 新范式
description: 这份 Workspace 为什么这样组织，和普通文档站有什么不同
order: 2
---

这篇介绍 **AGI-WorkSpace 这份工作空间本身**，不是当前业务项目的 PRD。换到真实项目后仍建议保留，方便新成员和 Agent 理解「知识写在哪、谁能改、Vue 做什么」。

## 核心判断

项目上下文应该活在 **Git 仓库的 Markdown** 里，而不是活在聊天记录或后台 CMS。Vue 只是壳：导航、搜索、预览编辑、按角色写回。

人和 AI Agent 读同一棵 `src/content/` 树。Agent 的硬约束在根目录 [AGENT.md](/space/harness/AGENT)。

## 和常见做法的差别

| 常见做法 | 本工作空间 |
| --- | --- |
| 每个文档一个 Vue 页面 | 只有 `DocView`，路径等于 Markdown slug |
| 文档存在数据库 / Headless CMS | 文档就是仓库里的 `.md` |
| 权限靠账号系统 | 配置中心勾选七个角色，可写范围是并集 |
| Agent 靠临时粘贴 | Agent 读仓库 + `AGENT.md` |
| 改文档必须会 Markdown | 预览里直接改，保存写回文件 |

## 三条原则

1. **MD-first：** 加知识 = 加 `.md`（新分类再加文件夹和 `index.md`）。不要为单篇文档加路由组件。
2. **角色即目录：** 角色 ID 锁在 `src/lib/roles.ts`。换项目只换对接人和正文，不新增第八个角色，除非明确要求。
3. **空间配置单独一组：** `src/content/space/` 不进左侧「文档」树。配置中心、项目引用、Harness 在侧栏底部。

## 七个角色怎么切开

产品事实在 [产品](/product)，工程事实在 [研发](/engineering)，体验在 [设计](/design)，质量在 [质量](/quality)，发布在 [交付](/delivery)，决策在 [记录](/records)。交叉处靠 slug 绑定，而不是再造一套 CMS 字段。

对照表见 [项目角色](/project/roles)。

## 换项目时动什么

- 改 [项目介绍文档](/start/project-intro)、[项目概述](/project/overview)、目标、状态、角色对接人
- 改 AGENT.md 第 1 节表格
- **不要**改角色 ID，不要把 Vue 拆成「一页一文档」
