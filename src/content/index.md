---
title: 项目首页
description: 工作空间总览，按七个角色填当前项目
order: 0
---

这是一个 **项目开发工作空间模版**。Vue 只是文档壳子；左侧分类对应 Markdown，用来沉淀给团队和 AI Agent 的上下文。

> [!TIP]
> 把占位换成当前项目即可。不要为每篇文档新建 Vue 页面。先在 [配置中心](/settings) 勾选角色并授权本地目录。

## 项目是什么

- **名称：** AGI-WorkSpace（换成当前项目名称）
- **一句话：** 按七个角色组织的项目知识模版，可在预览里修改并写回 `src/content/`
- **当前阶段：** 模版可用 / 立项 / 设计 / 研发 / 测试 / 上线 / 维护
- **仓库与环境：** （Git 地址、预览环境、生产环境）

## 七个角色是否都有文档

| 角色 | 关键文档 | 填完了吗 |
| --- | --- | --- |
| RD 研发设计 | [架构](/engineering/architecture) · [契约](/engineering/contracts) · [领域](/engineering/domain) · [规范](/engineering/conventions) · [协作](/engineering/collab) | 模版已齐，换项目后改内容 |
| FE 前端研发 | [前端结构](/engineering/frontend) | 模版已齐 |
| PM 产品设计 | [定义](/product/definition) · [用户](/product/users) · [PRD](/product/prd) · [原型与排期](/product/prototypes) · [概述](/project/overview) · [目标](/project/goals) | 模版已齐 |
| QA 测试 | [计划](/quality/testing) · [用例](/quality/cases) · [证据](/quality/evidence) · [缺陷](/quality/defects) | 模版已齐 |
| OP 运维 | [运维与交付](/delivery/ops) | 模版已齐 |
| UIUE 视觉与体验 | [体验](/design/experience) · [规范](/design/specs) · [交付](/design/handoff) | 模版已齐 |
| POM 项目与交付 | [角色](/project/roles) · [状态](/project/status) · [计划](/delivery/management) · [决策](/records/decisions) | 模版已齐 |

对照表详见 [项目角色](/project/roles)。

## 先读这些

1. [配置中心](/settings) — 勾选角色，授权本机工作目录，绑定代码空间
2. [项目引用](/space/references) — 这份空间引用哪些项目事实
3. [Harness / AGENT.md](/space/harness/AGENT) — Agent 允许做什么
4. [项目角色](/project/roles) — 七角色与可写目录
5. [项目概述](/project/overview) — 背景、范围、非目标
6. [项目目标](/project/goals) — 产品、技术、交付目标
7. [产品定义](/product/definition) — 定位与边界
8. [技术架构](/engineering/architecture) — 怎么做、约束是什么

## 使用约定

- 文档都在 `src/content/`，每个导航文件夹里都是 `.md`，一篇文档一个主题
- 用 frontmatter 的 `title`、`order`、`description` 控制侧栏
- 决策、取舍、事故一律记入 [项目决策](/records/decisions)，不要只留在聊天记录里
