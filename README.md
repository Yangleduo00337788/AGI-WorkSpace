# AGI-WorkSpace

面向研发项目的 **Workspace 模版**：Vue 3 只提供知识库壳子，项目上下文全部写在 `src/content/` 的 Markdown 里。

把模版里的占位段落换成当前项目即可。不要为每篇文档新建 Vue 页面。

## 开发

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## 内容

- 文件夹 = 左侧分类（项目 / 产品 / 设计 / 研发 / 质量 / 交付 / 记录）
- `.md` = 一篇文档
- `index.md` 是该分类的入口
- Frontmatter：`title`、`order`、`description`
