import type { NavNode } from '@/lib/content'
import { getDoc, isFolderNode } from '@/lib/content'
import { isOwnedSlug, isSharedWritableSlug, type RoleId } from '@/lib/roles'
import { syncCatalogFromDisk } from '@/lib/catalog-sync'
import {
  reconnectWorkspace,
  serializeMarkdown,
  useWorkspaceFs,
  workspaceFileExists,
  writeWorkspaceFile,
} from '@/lib/workspace-fs'

export function canEditSlug(slug: string, selected: RoleId[], owned: Set<string>) {
  if (!selected.length) return false
  const doc = getDoc(slug)
  if (!doc) return false
  if (doc.segments[0] === 'space' || isSharedWritableSlug(doc.slug)) return true
  return isOwnedSlug(doc.slug, owned)
}

export function canCreateIn(parentSlug: string, selected: RoleId[], owned: Set<string>) {
  if (!selected.length || !parentSlug) return false
  if (parentSlug === 'space' || parentSlug.startsWith('space/')) return true
  if (isSharedWritableSlug(parentSlug)) return true
  return isOwnedSlug(`${parentSlug}/__new__`, owned)
}

export function createParentForNode(node: NavNode, selected: RoleId[], owned: Set<string>) {
  if (node.slug === undefined) return ''
  if (node.slug === '') return canCreateIn('start', selected, owned) ? 'start' : ''
  if (isFolderNode(node) && canCreateIn(node.slug, selected, owned)) return node.slug
  if (!isFolderNode(node)) {
    if (canCreateIn(node.slug, selected, owned)) return node.slug
    const slash = node.slug.lastIndexOf('/')
    const parent = slash === -1 ? '' : node.slug.slice(0, slash)
    if (parent && canCreateIn(parent, selected, owned)) return parent
  }
  return ''
}

export async function createWorkspaceDoc(payload: {
  title: string
  description: string
  relPath: string
  slug: string
  order: number
}) {
  const { status, ready } = useWorkspaceFs()
  if (status.value === 'need-permission') await reconnectWorkspace()
  if (!ready.value) throw new Error('NEED_WORKSPACE')
  if (await workspaceFileExists(payload.relPath)) throw new Error('EXISTS')
  const stub = {
    title: payload.title,
    description: payload.description,
    order: payload.order,
    slug: payload.slug,
    content: '',
    segments: payload.slug.split('/'),
    isIndex: payload.relPath.endsWith('/index.md'),
    relPath: payload.relPath,
  }
  const body = `# ${payload.title}\n\n`
  await writeWorkspaceFile(payload.relPath, serializeMarkdown(stub, body))
  await syncCatalogFromDisk()
}
