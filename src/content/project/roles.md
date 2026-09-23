---
title: 项目角色
description: 与配置中心一致的七个角色、职责与目录
order: 3
---

先在 [配置中心](/settings#roles) 勾选角色。可维护范围是所选角色负责目录的并集，其它空间仍可阅读。

本模版固定七个角色，与配置中心一一对应。换项目时只改对接人，不要改角色 ID。

| 角色 | 配置中心 | 职责 | 对接人 |
| --- | --- | --- | --- |
| 研发设计 | RD | 技术方案、领域模型、接口契约、工程规范、研发协作记录 |  |
| 前端研发 | FE | 前端结构、交互状态、组件契约、无障碍 |  |
| 产品设计 | PM | 用户场景、PRD、业务流程、思维导图、交互原型、排期与验收 |  |
| 测试 | QA | 测试计划、用例、执行证据、缺陷 |  |
| 运维 | OP | 环境、发布、监控、应急与回滚 |  |
| 视觉与体验设计 | UIUE | 体验原则、视觉规范、交互稿、设计交付 |  |
| 项目与交付管理 | POM | 角色表、里程碑、依赖、风险、进度、跨角色交接、决策记录 |  |

## 角色 → 文档

| 角色 | 负责目录 / 文档 |
| --- | --- |
| RD | [研发](/engineering)、[技术架构](/engineering/architecture)、[工程规范](/engineering/conventions)、[接口契约](/engineering/contracts)、[领域设计](/engineering/domain)、[研发协作](/engineering/collab) |
| FE | [前端结构](/engineering/frontend) |
| PM | [产品](/product)、[产品定义](/product/definition)、[用户与需求](/product/users)、[产品需求](/product/prd)、[原型与排期](/product/prototypes)、[项目概述](/project/overview)、[项目目标](/project/goals) |
| QA | [质量](/quality)、[测试与质量](/quality/testing)、[测试用例](/quality/cases)、[执行证据](/quality/evidence)、[缺陷记录](/quality/defects) |
| OP | [运维与交付](/delivery/ops) |
| UIUE | [设计](/design)、[设计与体验](/design/experience)、[视觉规范](/design/specs)、[设计交付](/design/handoff) |
| POM | [项目](/project)、[项目角色](/project/roles)、[项目状态](/project/status)、[交付](/delivery)、[项目管理](/delivery/management)、[记录](/records)、[项目决策](/records/decisions) |

## 协作约定

- **需求入口：** PM 写入 [用户与需求](/product/users) 和 [产品需求](/product/prd)，评审通过后再进研发。
- **设计入口：** UIUE 在 [设计交付](/design/handoff) 勾选完成，FE 才按稿实现。
- **契约入口：** RD 改接口必须先改 [接口契约](/engineering/contracts)，再通知 FE / QA。
- **发布入口：** QA 门禁通过后，OP 按 [运维与交付](/delivery/ops) 发布；回滚同样走该页。
- **决策入口：** 聊天里达成的结论，POM 当天写入 [项目决策](/records/decisions)。
- **紧急升级：** 阻塞超过一个工作日 → 对接人 → POM → 项目负责人。
