<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronRight, FileText, Folder, FolderInput, FolderOpen, Pencil, Plus } from 'lucide-vue-next'
import type { NavNode } from '@/lib/content'
import { getDoc, isFolderNode, slugFromPath } from '@/lib/content'
import { canEditSlug, canMoveDoc, createParentForNode } from '@/lib/doc-manage'
import { useRoles } from '@/composables/useRoles'
import { useI18n } from '@/composables/useI18n'
import { isOwnedSlug } from '@/lib/roles'
import { cn } from '@/lib/utils'

const props = defineProps<{
  nodes: NavNode[]
  depth?: number
  showActions?: boolean
  initiallyOpen?: string[]
}>()

const emit = defineEmits<{
  navigate: []
  create: [parentSlug: string]
  edit: [slug: string]
  move: [slug: string]
}>()

const { t } = useI18n()
const route = useRoute()
const depth = computed(() => props.depth ?? 0)
const showActions = computed(() => props.showActions !== false)
const openIds = ref<Set<string>>(new Set())
const { selected, ownedSlugs } = useRoles()

function isOwned(node: NavNode) {
  if (!selected.value.length) return true
  if (node.slug !== undefined && isOwnedSlug(node.slug, ownedSlugs.value)) return true
  return isOwnedSlug(node.id, ownedSlugs.value)
}

function currentSlug() {
  return slugFromPath(route.path)
}

function isActive(slug?: string) {
  if (slug === undefined) return false
  return currentSlug() === slug
}

function isAncestor(node: NavNode): boolean {
  const current = currentSlug()
  if (!current) return node.id === 'start'
  return current.startsWith(`${node.id}/`) || current === node.id
}

function canEditNode(node: NavNode) {
  if (node.slug === undefined) return false
  return canEditSlug(node.slug, selected.value, ownedSlugs.value)
}

function createParent(node: NavNode) {
  return createParentForNode(node, selected.value, ownedSlugs.value)
}

function canMoveNode(node: NavNode) {
  if (node.slug === undefined) return false
  const current = getDoc(node.slug)
  if (!current) return false
  return canMoveDoc(current, selected.value, ownedSlugs.value)
}

function onCreate(event: Event, node: NavNode) {
  event.preventDefault()
  event.stopPropagation()
  const parent = createParent(node)
  if (!parent) return
  emit('create', parent)
}

function onEdit(event: Event, node: NavNode) {
  event.preventDefault()
  event.stopPropagation()
  if (node.slug === undefined) return
  emit('edit', node.slug)
}

function onMove(event: Event, node: NavNode) {
  event.preventDefault()
  event.stopPropagation()
  if (node.slug === undefined) return
  emit('move', node.slug)
}

function toggle(id: string) {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}

function openFolder(id: string) {
  if (openIds.value.has(id)) return
  const next = new Set(openIds.value)
  next.add(id)
  openIds.value = next
}

function onFolderTitleClick(event: MouseEvent, node: NavNode) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    openFolder(node.id)
    emit('navigate')
    return
  }
  if (openIds.value.has(node.id) && isActive(node.slug)) {
    event.preventDefault()
    toggle(node.id)
    return
  }
  openFolder(node.id)
  emit('navigate')
}

watch(
  () => [route.fullPath, props.initiallyOpen, props.nodes] as const,
  () => {
    const next = new Set(openIds.value)
    for (const id of props.initiallyOpen ?? []) next.add(id)
    const walk = (nodes: NavNode[]) => {
      for (const node of nodes) {
        if (isFolderNode(node) && isAncestor(node)) next.add(node.id)
        if (node.children) walk(node.children)
      }
    }
    walk(props.nodes)
    openIds.value = next
  },
  { immediate: true },
)
</script>

<template>
  <ul class="flex flex-col gap-0.5" :style="{ paddingLeft: depth ? '0.7rem' : '0' }">
    <li v-for="node in nodes" :key="node.id">
      <div v-if="isFolderNode(node)" class="flex flex-col">
        <div
          class="group/nav flex items-center rounded-md transition-colors"
          :class="
            isActive(node.slug)
              ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
              : 'hover:bg-sidebar-accent/70'
          "
        >
          <button
            type="button"
            class="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-sidebar-accent-foreground"
            :aria-expanded="openIds.has(node.id)"
            :aria-label="node.title"
            @click.stop="toggle(node.id)"
          >
            <ChevronRight
              class="size-3.5 transition-transform duration-200"
              :class="openIds.has(node.id) ? 'rotate-90' : ''"
            />
          </button>
          <RouterLink
            v-if="node.slug !== undefined"
            :to="node.slug ? `/${node.slug}` : '/'"
            :class="
              cn(
                'flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-[13px] leading-5',
                !isOwned(node) && 'opacity-45',
                isActive(node.slug)
                  ? 'text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-accent-foreground',
              )
            "
            @click="onFolderTitleClick($event, node)"
          >
            <FolderOpen v-if="openIds.has(node.id)" class="size-3.5 shrink-0 text-muted-foreground" />
            <Folder v-else class="size-3.5 shrink-0 text-muted-foreground" />
            <span class="truncate">{{ node.title }}</span>
          </RouterLink>
          <button
            v-else
            type="button"
            class="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-[13px] font-medium leading-5 text-sidebar-foreground/90"
            @click="toggle(node.id)"
          >
            <FolderOpen v-if="openIds.has(node.id)" class="size-3.5 shrink-0 text-muted-foreground" />
            <Folder v-else class="size-3.5 shrink-0 text-muted-foreground" />
            <span class="truncate">{{ node.title }}</span>
          </button>
          <div
            v-if="showActions && (canEditNode(node) || createParent(node) || canMoveNode(node))"
            class="flex shrink-0 pr-0.5 opacity-0 transition-opacity group-hover/nav:opacity-100 group-focus-within/nav:opacity-100"
            :class="isActive(node.slug) ? 'opacity-100' : ''"
          >
            <button
              v-if="canEditNode(node)"
              type="button"
              class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
              :title="t('editDoc')"
              :aria-label="t('editDoc')"
              @click="onEdit($event, node)"
            >
              <Pencil class="size-3.5" />
            </button>
            <button
              v-if="canMoveNode(node)"
              type="button"
              class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
              :title="t('moveDoc')"
              :aria-label="t('moveDoc')"
              @click="onMove($event, node)"
            >
              <FolderInput class="size-3.5" />
            </button>
            <button
              v-if="createParent(node)"
              type="button"
              class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
              :title="t('newDoc')"
              :aria-label="t('newDoc')"
              @click="onCreate($event, node)"
            >
              <Plus class="size-3.5" />
            </button>
          </div>
        </div>
        <div
          class="grid transition-[grid-template-rows] duration-200 ease-out"
          :class="openIds.has(node.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <div class="mt-0.5 ml-3.5 border-l border-sidebar-border/80">
              <NavTree
                :nodes="node.children ?? []"
                :depth="depth + 1"
                :show-actions="showActions"
                :initially-open="initiallyOpen"
                @navigate="emit('navigate')"
                @create="emit('create', $event)"
                @edit="emit('edit', $event)"
                @move="emit('move', $event)"
              />
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="node.slug !== undefined"
        class="group/nav flex items-center rounded-md transition-colors"
        :class="[
          depth ? 'ml-7' : 'ml-0',
          isActive(node.slug)
            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
            : 'hover:bg-sidebar-accent/70',
        ]"
      >
        <RouterLink
          :to="node.slug ? `/${node.slug}` : '/'"
          :class="
            cn(
              'flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-[13px] leading-5',
              !isOwned(node) && 'opacity-45',
              isActive(node.slug)
                ? 'text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/75 hover:text-sidebar-accent-foreground',
            )
          "
          @click="emit('navigate')"
        >
          <FileText class="size-3.5 shrink-0 text-muted-foreground" />
          <span class="truncate">{{ node.title }}</span>
        </RouterLink>
        <div
          v-if="showActions && (canEditNode(node) || createParent(node) || canMoveNode(node))"
          class="flex shrink-0 pr-0.5 opacity-0 transition-opacity group-hover/nav:opacity-100 group-focus-within/nav:opacity-100"
          :class="isActive(node.slug) ? 'opacity-100' : ''"
        >
          <button
            v-if="canEditNode(node)"
            type="button"
            class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
            :title="t('editDoc')"
            :aria-label="t('editDoc')"
            @click="onEdit($event, node)"
          >
            <Pencil class="size-3.5" />
          </button>
          <button
            v-if="canMoveNode(node)"
            type="button"
            class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
            :title="t('moveDoc')"
            :aria-label="t('moveDoc')"
            @click="onMove($event, node)"
          >
            <FolderInput class="size-3.5" />
          </button>
          <button
            v-if="createParent(node)"
            type="button"
            class="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-sidebar-accent-foreground"
            :title="t('newDoc')"
            :aria-label="t('newDoc')"
            @click="onCreate($event, node)"
          >
            <Plus class="size-3.5" />
          </button>
        </div>
      </div>
    </li>
  </ul>
</template>
