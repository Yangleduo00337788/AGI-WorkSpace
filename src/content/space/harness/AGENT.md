---
title: AGENT.md
description: 约束 Agent 使用本工作空间模板时的规则
order: 1
---

# AGENT.md

你正在使用 **AGI-WorkSpace** 项目工作空间模板。先读规则再改仓库。

## 必须先读

1. `src/content/space/references.md` — 项目引用说明
2. `src/content/project/overview.md` — 当前项目范围
3. `src/content/project/roles.md` — 角色与可写目录

## 允许做的

- 按角色维护 `src/content/` 下对应 Markdown（含 frontmatter）。
- 更新空间配置文档：`src/content/space/`。
- 在用户明确要求时提交并推送 Git（遵守根目录 `.gitignore`）。
- 改与当前任务直接相关的 Vue / TS 代码。

## 禁止做的

- 不要把访问令牌、`.agi-workspace.local.json`、`.env` 写入仓库或文档。
- 不要为每一篇文档新建 Vue 页面；文档来自 `src/content/**/*.md`。
- 不要删除七个角色 ID（rd / fe / pm / qa / op / uiue / pom），换项目只改对接人和正文。
- 不要把 `src/content/space/` 做进左侧「文档」导航树。
- 不要扩大写权限到角色表以外的目录，除非用户明确要求。

## 改文档时

- 保留 YAML frontmatter 的 `title` / `description` / `order`。
- 用中文写模板正文，占位处标明「换成当前项目」。
- 保存 AGENT.md 时同步仓库根目录的 `AGENT.md`（无 frontmatter 的正文副本）。

## 换项目检查清单

- [ ] 项目概述、目标、状态已换成当前项目
- [ ] 角色对接人已更新
- [ ] 代码空间已绑定当前仓库
- [ ] 本文件中的项目名称与禁止项已核对
