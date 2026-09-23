# AGI-WorkSpace

面向研发项目的 **Workspace 模版**：纯前端静态工程，Vue 3 只提供知识库壳子，项目上下文全部写在 `src/content/` 的 Markdown 里。没有自建后端。

把模版里的占位段落换成当前项目即可。不要为每篇文档新建 Vue 页面。

## 开发

建议使用 Chrome / Edge。

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

打开后先到 **空间配置 → 配置中心**：勾选角色、授权项目根目录（内含 `src/content`），需要远程同步时再绑定代码空间。

## 内容

- 文件夹 = 左侧分类（开始阅读 / 项目 / 产品 / 设计 / 研发 / 质量 / 交付 / 记录）
- `.md` = 一篇文档
- `index.md` 是该分类的入口
- Frontmatter：`title`、`order`、`description`
- 空间配置文档在 `src/content/space/`，不进「文档」树
- Agent 约束：根目录 `AGENT.md`（与 `src/content/space/harness/AGENT.md` 正文同步）

换项目时优先改：概述、目标、状态、角色对接人、AGENT.md 第 1 节表格。
