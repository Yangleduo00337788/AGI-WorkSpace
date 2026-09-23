---
title: 工程规范
description: 目录、提交、分支、评审与文档同步
order: 2
---

RD 维护。代码和文档的共同规矩写在这里。

## 文档

- 业务上下文只写在 `src/content/`，不写进 Vue 组件注释里充数
- 新增分类 = 新建文件夹 + `index.md`
- 新增文档 = 新建 `.md` + frontmatter（`title` / `description` / `order`）
- 接口、领域、决策变更当天同步对应 MD

## 代码

- 文件与组件用英文命名；用户可见文案走 i18n 或 Markdown
- 不要为单篇文档增加路由组件
- 改布局、主题时沿用现有 visual token，不引入第二套颜色

## Git

| 项 | 约定（按团队改） |
| --- | --- |
| 主分支 | `main` |
| 功能分支 | `feat/<topic>`、`fix/<topic>` |
| 提交信息 | `feat:` / `fix:` / `docs:` 开头，说明为什么 |
| 评审 | 至少一人 Approve；契约变更必须 @FE @QA |

## 本地命令

```bash
npm install
npm run dev
npm run build
```

## 文档同步检查

- [ ] 写回 / Git 推送约定变了 → [接口契约](/engineering/contracts)
- [ ] 领域变了 → [领域设计](/engineering/domain)
- [ ] 取舍定了 → [项目决策](/records/decisions)
- [ ] 前端结构变了 → 通知 FE 更新 [前端结构](/engineering/frontend)
