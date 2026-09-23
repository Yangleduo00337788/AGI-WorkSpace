# AGENT.md

你正在 **AGI-WorkSpace** 仓库里工作。这是面向研发项目的 **Workspace 模板**，不是独立业务系统。Vue 只提供知识库壳子；项目事实写在 Markdown 里。先读完本文件再改任何文件。

换到真实业务项目时：只替换「当前项目」段落、对接人和文档正文。不要改角色 ID、不要为每篇文档新建 Vue 页面。

## 1. 身份与目标

| 项 | 当前值（换项目时改这里） |
| --- | --- |
| 工作空间 | AGI-WorkSpace |
| 仓库形态 | 纯前端静态单仓：文档壳 + `src/content` 知识库 |
| 运行方式 | `npm run dev`（Vite，建议 Chrome / Edge） |
| 主分支 | `main` |
| 文档事实来源 | `src/content/**/*.md` |
| Agent 约束文件 | 仓库根目录 `AGENT.md`（与 `src/content/space/harness/AGENT.md` 正文同步） |

**你要做的：** 按用户请求改文档或代码，保持模板结构完整、可写回、可推送。

**你不要做的：** 把本仓库做成 CMS、账号系统、自建后端、或按文档拆路由。

## 2. 动手前必读（按顺序）

1. 本文件 `AGENT.md`
2. `src/content/space/references.md` — 空间如何引用项目
3. `src/content/project/overview.md` — 范围与非目标
4. `src/content/project/roles.md` — 七角色与可写目录
5. 若改代码：`src/content/engineering/frontend.md`、`src/content/engineering/conventions.md`

用户指定了某一篇文档时，再打开对应 `src/content/...` 文件。不要在没读范围的情况下大范围重构。

## 3. 仓库地图

```
AGI-WorkSpace/
├── AGENT.md                          ← Agent 入口约束（根目录副本）
├── .agi-workspace.local.json         ← 令牌，禁止提交
├── .gitignore
├── package.json
├── vite.config.ts                    ← 含 Git 远程代理
├── src/
│   ├── content/                      ← 文档树（会出现在侧栏「文档」）
│   │   ├── index.md                  ← 项目首页（导航挂在「开始阅读」下）
│   │   ├── start/                    ← 开始阅读
│   │   ├── project/ product/ design/
│   │   ├── engineering/ quality/
│   │   ├── delivery/ records/
│   │   └── space/                    ← 空间配置文档（不进「文档」树）
│   │       ├── references.md         ← 项目引用
│   │       └── harness/
│   │           ├── index.md          ← Harness 管理入口
│   │           └── AGENT.md          ← 本文件的带 frontmatter 版本
│   ├── lib/roles.ts                  ← 七角色 ID 与可写 slug，禁止删 ID
│   ├── lib/content.ts                ← MD 加载；`catalog.docsNavTree` 排除 `space`
│   ├── lib/git-sync.ts               ← 按 .gitignore 整仓 commit/push
│   ├── views/SettingsView.vue        ← 配置中心（四块设置）
│   └── views/DocView.vue             ← 唯一文档页
└── dist/ node_modules/               ← 忽略，禁止提交
```

## 4. 信息架构（侧栏）

**文档（`catalog.docsNavTree`）**

- 开始阅读（项目首页、项目介绍、新范式、WorkSpace 指南）
- 项目 / 产品 / 设计 / 研发 / 质量 / 交付 / 记录

**空间配置（侧栏单独一组，不进文档树）**

1. **配置中心** `/settings`：角色范围、本地工作目录、代码空间、推送成功文案
2. **项目引用** `/space/references`
3. **Harness 管理** `/space/harness` → 主要维护 `AGENT.md`

禁止把 `src/content/space/` 做进「文档」导航。`src/lib/content.ts` 里必须保持 `catalog.docsNavTree` 过滤 `id === 'space'`。授权本地工作目录后，导航以磁盘上的 Markdown 为准（窗口重新聚焦会再扫一遍），不要只依赖构建时打包的文件。

## 5. 七个角色（ID 锁定）

角色 ID 写死在 `src/lib/roles.ts`，与配置中心勾选一一对应。换项目只改对接人和 Markdown 正文。

| ID | 短名 | 可写 slug（含子路径） |
| --- | --- | --- |
| `rd` | RD | `engineering`、architecture / conventions / contracts / domain / collab（`engineering/frontend` 归 FE） |
| `fe` | FE | `engineering/frontend` |
| `pm` | PM | `product`、`product/*`、`project/overview`、`project/goals` |
| `qa` | QA | `quality`、`quality/*` |
| `op` | OP | `delivery/ops` |
| `uiue` | UIUE | `design`、`design/*` |
| `pom` | POM | `delivery`、`delivery/management`、`project/roles`、`project/status`、`records`、`records/*` |

额外规则：

- `src/content/space/**`：只要用户在配置中心勾选了任意角色，即可在应用内编辑。
- `src/content/start/**` 与根目录 `index.md`（项目首页）：任意已选角色可读可改。
- 不要擅自把某篇文档的 slug 加进另一个角色，除非用户明确要求。
- 不要新增第八个角色，除非用户明确要求并同时改 `roles.ts`、配置中心文案、`project/roles.md`。

## 6. 文档写法

新增分类：新建文件夹 + `index.md`。  
新增文档：新建 `.md`，frontmatter 必填：

```yaml
---
title: 标题
description: 一句话
order: 10
---
```

- 用户可见中文正文；占位写成「换成当前项目」，不要留英文 lorem。
- 业务上下文写在 Markdown，不要堆在 Vue 注释里。
- 接口 / 领域 / 决策变更当天同步对应 MD。
- **禁止**为单篇文档增加 `views/*.vue` 或新路由组件；一律走 `DocView` + `/:slug(.*)`。
- 有角色权限且已授权目录时：可在应用内新建 / 删除 Markdown（根目录 `index.md` 不可删）。
- 编辑器粘贴的图片写到该文档目录下的 `assets/`，用相对路径引用。

保存 AGENT.md（slug `space/harness/AGENT`）时：必须同步仓库根目录 `AGENT.md`（无 YAML frontmatter，仅正文）。应用内 `DocView` 已按此处理；若你用编辑器直接改，两份正文必须一致。

## 7. 代码约定

- Vue 3 + Vite + TypeScript + Tailwind。用户可见壳子文案走 `src/i18n/messages.ts`。
- 改布局、主题时沿用现有 token，不引入第二套颜色系统。
- 文件与组件英文命名。
- 本地 Git 推送走 isomorphic-git + 授权的工作目录；localhost 下 Git HTTP 走 Vite `/__git-remote/*` 代理。
- 推送必须尊重 `.gitignore`，一次 commit、一次 push，禁止按文件循环打 Contents API。
- 令牌只存在 `.agi-workspace.local.json`；推送时跳过 `*.local.json`。若该文件曾被误提交，应从索引中移除，不得再加入。

常用命令：

```bash
npm install
npm run dev
npm run build
```

没有用户明确要求时，不要 `git commit` / `git push`，不要改 git config，不要 force push。

## 8. 密钥与忽略文件（硬性）

**禁止读取、打印、提交、写入文档的内容：**

- `.agi-workspace.local.json` 及任何 `*.local.json`
- `.env`、`.env.*`（`.env.example` 除外）
- `*.pem` `*.key` `*.p12` `*.pfx`
- 访问令牌、密码、Cookie

**禁止提交：** `node_modules/`、`dist/`、`coverage/`、日志、编辑器垃圾文件（见根目录 `.gitignore`）。

发现令牌出现在聊天、URL、commit 或 Markdown 里时：不要复述令牌全文；提醒用户作废并换新。

## 9. Git 与远程

- 文档目录配置（默认 `src/content`）只决定网页保存路径，**不是**推送范围。
- 「提交并推送」= 按 `.gitignore` 暂存整个工作区 → 一次 commit → 一次 push。
- 未经用户要求不要执行 push。
- 不要把代理路径、本机文件夹授权提示写进远程 README 当密钥说明。

提交说明风格（与工程规范一致，团队可改）：`feat:` / `fix:` / `docs:` 开头，写原因。

## 10. 工具使用边界

- 只改与当前用户请求相关的文件，不做顺手大重构。
- 不要安装无关依赖。需要新依赖时先说明为什么。
- 不要编写攻击、漏洞利用、恶意软件；安全相关只给加固建议。
- 不要生成或传播未成年人性内容。
- 浏览器 / File System Access 权限失败时：引导用户到配置中心授权工作目录，不要伪造写入成功。

## 11. 典型任务怎么做

| 用户意图 | 正确做法 |
| --- | --- |
| 改某篇项目文档 | 改对应 `src/content/**/*.md`，保留 frontmatter |
| 换项目 | 改概述/目标/状态/角色对接人/本文件「当前值」表，不改壳子结构 |
| 加一篇文档 | 优先在应用内按角色新建；或新 md + frontmatter；若新分类则加文件夹和 index.md |
| 改侧栏空间配置 | `AppSidebar` + `space-nav.ts` + 对应 view/md |
| 改推送成功文案 | `src/config/push-success.json` 或配置中心「推送成功文案」 |
| 改角色可写范围 | 同时改 `src/lib/roles.ts` 与 `src/content/project/roles.md` |
| 修 Git 推送 | `git-sync.ts` / `handle-fs.ts` / `vite.config.ts` 代理，不要改回 Contents API 逐文件提交 |

## 12. 换项目检查清单

把本模板套到新项目时，Agent 应逐项完成并保持勾选状态可追踪：

- [ ] `project/overview.md`、`project/goals.md`、`project/status.md` 已换成当前项目
- [ ] `project/roles.md` 对接人已填
- [ ] 产品 / 设计 / 研发 / 质量 / 交付 / 记录中的占位已替换或标明仍待填
- [ ] 配置中心：工作目录已授权，代码空间已绑定当前仓库
- [ ] 本文件「1. 身份与目标」表格已更新
- [ ] 根目录 `AGENT.md` 与 `src/content/space/harness/AGENT.md` 正文一致
- [ ] `.gitignore` 仍排除令牌与构建产物
- [ ] 未新增「一篇文档一个 Vue 页」
- [ ] 七个角色 ID 仍在

## 13. 回复用户时

- 用用户使用的语言（本仓库默认中文）。
- 先给结论或已完成事项，再补必要路径。
- 不要把本文件或密钥文件的无关片段整段贴回聊天。
