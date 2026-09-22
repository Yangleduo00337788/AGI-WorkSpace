import { docOverrides } from '@/lib/doc-store'

export interface DocEntry {
  slug: string
  title: string
  description: string
  order: number
  content: string
  segments: string[]
  isIndex: boolean
  relPath: string
}

export interface NavNode {
  id: string
  title: string
  slug?: string
  order: number
  kind: 'folder' | 'doc'
  children?: NavNode[]
}

interface Frontmatter {
  title?: string
  description?: string
  order?: number
}

const files = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  if (!raw.startsWith('---')) {
    return { data: {}, content: raw }
  }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) {
    return { data: {}, content: raw }
  }
  const fm = raw.slice(3, end).trim()
  const content = raw.slice(end + 4).replace(/^\r?\n/, '')
  const data: Frontmatter = {}
  for (const line of fm.split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key === 'order' && /^\d+$/.test(value)) {
      data.order = Number(value)
    } else if (key === 'title') {
      data.title = value
    } else if (key === 'description') {
      data.description = value
    }
  }
  return { data, content }
}

function contentRelPath(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/')
  const marker = '/content/'
  const idx = normalized.lastIndexOf(marker)
  return idx >= 0 ? normalized.slice(idx + marker.length) : normalized.split('/').slice(-1)[0]!
}

function toSlug(filePath: string): string {
  const normalized = filePath.replaceAll('\\', '/')
  const marker = '/content/'
  const idx = normalized.lastIndexOf(marker)
  let rel = idx >= 0 ? normalized.slice(idx + marker.length) : normalized
  rel = rel.replace(/\.md$/, '')
  if (rel.endsWith('/index')) {
    rel = rel.slice(0, -'/index'.length)
  }
  if (rel === 'index') return ''
  return rel
}

function isIndexFile(filePath: string): boolean {
  return filePath.replaceAll('\\', '/').endsWith('/index.md') || filePath.replaceAll('\\', '/').endsWith('content/index.md')
}

function titleFromSegment(segment: string): string {
  return segment
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function compareNodes(a: NavNode, b: NavNode): number {
  if (a.order !== b.order) return a.order - b.order
  return a.title.localeCompare(b.title, 'zh')
}

function sortTree(nodes: NavNode[]): NavNode[] {
  const sorted = [...nodes].sort(compareNodes)
  for (const node of sorted) {
    if (node.children) node.children = sortTree(node.children)
  }
  return sorted
}

function flattenNav(nodes: NavNode[]): DocEntry[] {
  const list: DocEntry[] = []
  const visit = (items: NavNode[]) => {
    for (const item of items) {
      if (item.slug !== undefined) {
        const found = docsBySlug.get(item.slug)
        if (found) list.push(found)
      }
      if (item.children) visit(item.children)
    }
  }
  visit(nodes)
  return list
}

export const docs: DocEntry[] = Object.entries(files)
  .map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    const slug = toSlug(path)
    const segments = slug ? slug.split('/') : []
    const fallback = segments.length ? titleFromSegment(segments[segments.length - 1]!) : 'AGI-WorkSpace'
    return {
      slug,
      title: data.title ?? fallback,
      description: data.description ?? '',
      order: data.order ?? 100,
      content,
      segments,
      isIndex: isIndexFile(path) || slug === '',
      relPath: contentRelPath(path),
    } satisfies DocEntry
  })
  .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))

export const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]))

function buildNav(): NavNode[] {
  const root: NavNode[] = []
  const folders = new Map<string, NavNode>()

  const ensureFolder = (segments: string[]): NavNode => {
    let parentChildren = root
    let path = ''
    let node: NavNode | undefined
    for (const segment of segments) {
      path = path ? `${path}/${segment}` : segment
      node = folders.get(path)
      if (!node) {
        node = {
          id: path,
          title: titleFromSegment(segment),
          order: 100,
          kind: 'folder',
          children: [],
        }
        folders.set(path, node)
        parentChildren.push(node)
      }
      parentChildren = node.children!
    }
    return node!
  }

  for (const doc of docs) {
    if (!doc.segments.length) {
      root.push({
        id: 'home',
        title: doc.title,
        slug: doc.slug,
        order: doc.order,
        kind: 'doc',
      })
      continue
    }

    if (doc.isIndex) {
      const folder = ensureFolder(doc.segments)
      folder.title = doc.title
      folder.slug = doc.slug
      folder.order = doc.order
      continue
    }

    const folderSegs = doc.segments.slice(0, -1)
    const leaf: NavNode = {
      id: doc.slug,
      title: doc.title,
      slug: doc.slug,
      order: doc.order,
      kind: 'doc',
    }
    if (folderSegs.length) {
      const parent = ensureFolder(folderSegs)
      parent.children = parent.children ?? []
      parent.children.push(leaf)
      parent.order = Math.min(parent.order, doc.order)
    } else {
      root.push(leaf)
    }
  }

  return sortTree(root)
}

export const navTree = buildNav()
export const orderedDocs = flattenNav(navTree)

export function slugFromPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '')
}

export function getDoc(slug: string): DocEntry | undefined {
  const base = docsBySlug.get(slug)
  if (!base) return undefined
  const overlay = docOverrides.get(slug)
  if (overlay === undefined) return base
  return { ...base, content: overlay }
}

export function docDir(doc: DocEntry): string {
  if (!doc.slug) return ''
  if (doc.isIndex) return doc.slug
  const i = doc.slug.lastIndexOf('/')
  return i === -1 ? '' : doc.slug.slice(0, i)
}

export function getNeighbors(slug: string): { prev?: DocEntry; next?: DocEntry } {
  const index = orderedDocs.findIndex((doc) => doc.slug === slug)
  if (index === -1) return {}
  return {
    prev: orderedDocs[index - 1],
    next: orderedDocs[index + 1],
  }
}

export function breadcrumbs(slug: string): { title: string; slug?: string }[] {
  const doc = getDoc(slug)
  if (!doc || !slug) return []
  const crumbs: { title: string; slug?: string }[] = []
  let acc = ''
  for (const segment of doc.segments) {
    acc = acc ? `${acc}/${segment}` : segment
    const match = docsBySlug.get(acc)
    crumbs.push({
      title: match?.title ?? titleFromSegment(segment),
      slug: match ? acc : undefined,
    })
  }
  return crumbs
}

export function isFolderNode(node: NavNode): boolean {
  return node.kind === 'folder' || Boolean(node.children?.length)
}

export function findNavNode(id: string, nodes: NavNode[] = navTree): NavNode | undefined {
  for (const node of nodes) {
    if (node.id === id || node.slug === id) return node
    if (node.children?.length) {
      const found = findNavNode(id, node.children)
      if (found) return found
    }
  }
}

export function pageChildren(slug: string): { folders: NavNode[]; docs: NavNode[] } {
  const kids = slug ? (findNavNode(slug)?.children ?? []) : navTree
  const folders: NavNode[] = []
  const docs: NavNode[] = []
  for (const node of kids) {
    if (node.slug === slug) continue
    if (isFolderNode(node)) folders.push(node)
    else docs.push(node)
  }
  return { folders, docs }
}
