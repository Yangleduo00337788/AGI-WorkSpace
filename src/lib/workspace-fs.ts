import { computed, ref } from 'vue'
import { openDb, STORE_HANDLES } from '@/lib/idb'
import type { DocEntry } from '@/lib/content'

const HANDLE_KEY = 'workspace-root'

export type FsStatus = 'unsupported' | 'disconnected' | 'need-permission' | 'ready'

const status = ref<FsStatus>('disconnected')
const folderName = ref('')
const fsError = ref('')

function isPickerAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'
}

async function queryWrite(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
  if (typeof handle.queryPermission !== 'function') return 'granted'
  return handle.queryPermission({ mode: 'readwrite' })
}

async function requestWrite(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
  if (typeof handle.requestPermission !== 'function') return 'granted'
  return handle.requestPermission({ mode: 'readwrite' })
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HANDLES, 'readonly')
    const req = tx.objectStore(STORE_HANDLES).get(HANDLE_KEY)
    req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function persistHandle(handle: FileSystemDirectoryHandle | null): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_HANDLES, 'readwrite')
    const store = tx.objectStore(STORE_HANDLES)
    if (handle) store.put(handle, HANDLE_KEY)
    else store.delete(HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getChildDir(
  parent: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await parent.getDirectoryHandle(name)
  } catch {
    return null
  }
}

async function resolveContentDir(root: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  const src = await getChildDir(root, 'src')
  const nested = src ? await getChildDir(src, 'content') : null
  if (nested) return nested
  const direct = await getChildDir(root, 'content')
  if (direct) return direct
  throw new Error('FOLDER_INVALID')
}

let contentDir: FileSystemDirectoryHandle | null = null
let rootHandle: FileSystemDirectoryHandle | null = null

async function applyHandle(handle: FileSystemDirectoryHandle, request = false): Promise<void> {
  const perm = request ? await requestWrite(handle) : await queryWrite(handle)
  if (perm !== 'granted') {
    rootHandle = handle
    contentDir = null
    folderName.value = handle.name
    status.value = 'need-permission'
    return
  }
  contentDir = await resolveContentDir(handle)
  rootHandle = handle
  folderName.value = handle.name
  status.value = 'ready'
  fsError.value = ''
}

export async function hydrateWorkspaceFs(): Promise<void> {
  if (!isPickerAvailable()) {
    status.value = 'unsupported'
    return
  }
  try {
    const handle = await loadHandle()
    if (!handle) {
      status.value = 'disconnected'
      folderName.value = ''
      return
    }
    await applyHandle(handle, false)
  } catch (error) {
    console.warn(error)
    status.value = 'disconnected'
    folderName.value = ''
  }
}

export async function authorizeWorkspace(): Promise<void> {
  if (!isPickerAvailable()) {
    status.value = 'unsupported'
    throw new Error('UNSUPPORTED')
  }
  fsError.value = ''
  const picker = window.showDirectoryPicker
  if (!picker) {
    status.value = 'unsupported'
    throw new Error('UNSUPPORTED')
  }
  const handle = await picker({
    id: 'agi-workspace',
    mode: 'readwrite',
  })
  await persistHandle(handle)
  try {
    await applyHandle(handle, true)
  } catch (error) {
    fsError.value = error instanceof Error && error.message === 'FOLDER_INVALID' ? 'invalid' : 'unknown'
    status.value = 'disconnected'
    throw error
  }
}

export async function reconnectWorkspace(): Promise<void> {
  if (!rootHandle) {
    await authorizeWorkspace()
    return
  }
  await applyHandle(rootHandle, true)
  if (status.value !== 'ready') throw new Error('PERMISSION_DENIED')
}

export async function disconnectWorkspace(): Promise<void> {
  await persistHandle(null)
  rootHandle = null
  contentDir = null
  folderName.value = ''
  status.value = isPickerAvailable() ? 'disconnected' : 'unsupported'
}

async function fileHandle(relPath: string, create: boolean): Promise<FileSystemFileHandle> {
  if (!contentDir || status.value !== 'ready') throw new Error('NOT_READY')
  const parts = relPath.split('/').filter(Boolean)
  const fileName = parts.pop()
  if (!fileName) throw new Error('BAD_PATH')
  let dir = contentDir
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create })
  }
  return dir.getFileHandle(fileName, { create })
}

export async function writeWorkspaceFile(relPath: string, text: string): Promise<void> {
  const file = await fileHandle(relPath, true)
  const writable = await file.createWritable()
  await writable.write(text)
  await writable.close()
}

export async function readWorkspaceFile(relPath: string): Promise<string | null> {
  try {
    const file = await fileHandle(relPath, false)
    const blob = await file.getFile()
    return blob.text()
  } catch {
    return null
  }
}

function yamlScalar(value: string): string {
  if (value === '') return '""'
  if (/[:#{}[\],&*?!|>'"%@`]|^\s|\s$/.test(value)) return JSON.stringify(value)
  return value
}

export function serializeMarkdown(doc: DocEntry, body: string): string {
  return `---\ntitle: ${yamlScalar(doc.title)}\ndescription: ${yamlScalar(doc.description)}\norder: ${doc.order}\n---\n\n${body.replace(/^\n+/, '')}\n`
}

function assertSafeRelPath(relPath: string) {
  const parts = relPath.replaceAll('\\', '/').split('/').filter(Boolean)
  if (!parts.length || parts.some((part) => part === '.' || part === '..')) {
    throw new Error('BAD_PATH')
  }
  return parts
}

export async function writeRepoFile(relPath: string, text: string): Promise<void> {
  if (!rootHandle || status.value !== 'ready') throw new Error('NOT_READY')
  const parts = assertSafeRelPath(relPath)
  const fileName = parts.pop()!
  let dir = rootHandle
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part, { create: true })
  }
  const file = await dir.getFileHandle(fileName, { create: true })
  const writable = await file.createWritable()
  await writable.write(text)
  await writable.close()
}

export async function readRepoFile(relPath: string): Promise<string | null> {
  if (!rootHandle || status.value !== 'ready') return null
  try {
    const parts = assertSafeRelPath(relPath)
    const fileName = parts.pop()!
    let dir = rootHandle
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part)
    }
    const blob = await (await dir.getFileHandle(fileName)).getFile()
    return blob.text()
  } catch {
    return null
  }
}

function assertSafeFileName(name: string) {
  if (!name || name.includes('/') || name.includes('\\') || name === '.' || name === '..') {
    throw new Error('BAD_PATH')
  }
}

export async function writeProjectFile(name: string, text: string): Promise<void> {
  if (!rootHandle || status.value !== 'ready') throw new Error('NOT_READY')
  assertSafeFileName(name)
  const file = await rootHandle.getFileHandle(name, { create: true })
  const writable = await file.createWritable()
  await writable.write(text)
  await writable.close()
}

export async function readProjectFile(name: string): Promise<string | null> {
  if (!rootHandle || status.value !== 'ready') return null
  assertSafeFileName(name)
  try {
    const blob = await (await rootHandle.getFileHandle(name)).getFile()
    return blob.text()
  } catch {
    return null
  }
}

export async function removeProjectFile(name: string): Promise<void> {
  if (!rootHandle || status.value !== 'ready') return
  assertSafeFileName(name)
  try {
    await rootHandle.removeEntry(name)
  } catch {
    /* missing is fine */
  }
}

export function getWorkspaceRoot(): FileSystemDirectoryHandle | null {
  return status.value === 'ready' ? rootHandle : null
}

export function useWorkspaceFs() {
  return {
    status: computed(() => status.value),
    folderName: computed(() => folderName.value),
    error: computed(() => fsError.value),
    ready: computed(() => status.value === 'ready'),
  }
}
