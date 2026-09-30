---
title: 项目首页
description: 工作空间总览，按七个角色填当前项目
order: 0
---

> [!TIP]
> 换到真实项目时：在 [配置中心](/settings#brand) 更换名称、Logo 和口号，再改下面的占位。不要为每一篇文档新建 Vue 页面。先勾选角色并授权本地目录。

## 这是什么

**AGI-WorkSpace** 把「项目上下文」从聊天记录里拿出来，按七个角色写进仓库里的 Markdown。浏览器只是壳：读、搜、按权限改、写回 `src/content/`。人和 AI Agent 打开同一棵目录。

换项目后，这里应能用三句话回答：项目叫什么、现在做到哪、仓库在哪。更完整的说明在 [项目介绍文档](/start/project-intro)。

| 项 | 当前值（换项目时改） |
| --- | --- |
| 名称 | AGI-WorkSpace |
| Slogan | 知识写进仓库，人和 Agent 共用一份上下文 |
| 一句话 | 按七个角色组织的项目知识工作空间模版 |
| 当前阶段 | 模版可用 / 立项 / 设计 / 研发 / 测试 / 上线 / 维护 |
| 仓库 | （Git 地址） |
| 预览 | `npm run dev`（建议 Chrome / Edge） |
| 生产 / 托管 | （若有） |

## 建议怎么读

1. [项目介绍文档](/start/project-intro) — 这个项目是什么、给谁、边界在哪
2. [AGI-WorkSpace 新范式](/start/paradigm) — 为什么用 Workspace 而不是 CMS 或一页一文档
3. [WorkSpace 指南](/start/guide) — 怎么勾角色、改文档、授权目录、推送
4. 再进你负责的分类：项目总览、产品设计、体验设计、研发设计、质量保障、交付运维、过程记录

页面下方「开始阅读」目录与左侧相同，可逐级展开。

## 七个角色是否都有文档

| 角色 | 关键文档 | 填完了吗 |
| --- | --- | --- |
| RD 研发设计 | [架构](/engineering/tech/architecture) · [契约](/engineering/process/contracts) · [领域](/engineering/tech/domain) · [规范](/engineering/process/conventions) · [协作](/engineering/process/collab) | 模版已齐，换项目后改内容 |
| FE 前端研发 | [前端结构](/engineering/frontend) | 模版已齐 |
| PM 产品设计 | [定义](/product/definition) · [用户](/product/discovery/users) · [PRD](/product/spec/prd) · [原型与排期](/product/spec/prototypes) · [概述](/project/charter/overview) · [目标](/project/charter/goals) | 模版已齐 |
| QA 测试 | [计划](/quality/plan/testing) · [用例](/quality/run/cases) · [证据](/quality/run/evidence) · [缺陷](/quality/run/defects) | 模版已齐 |
| OP 运维 | [运维与交付](/delivery/ops) | 模版已齐 |
| UIUE 视觉与体验 | [体验](/design/system/experience) · [规范](/design/system/specs) · [交付](/design/handoff) | 模版已齐 |
| POM 项目与交付 | [角色](/project/governance/roles) · [状态](/project/governance/status) · [计划](/delivery/management) · [决策](/records/decisions) | 模版已齐 |

对照表见 [项目角色](/project/governance/roles)。**开始阅读**（含本页）只要勾了任意角色就可以读、改。

## 使用约定

- 文档都在 `src/content/`，一篇文档一个主题；新分类 = 新文件夹 + `index.md`，允许多层嵌套，不要在同一层堆几十个 `.md`
- Frontmatter 的 `title`、`order`、`description` 控制侧栏
- 决策、取舍、事故写入 [项目决策](/records/decisions)，不要只留在聊天里
- Agent 动手前先读根目录 [AGENTS.md](/space/harness/AGENTS)
