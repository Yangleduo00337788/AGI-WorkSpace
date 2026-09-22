<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import DocToc from '@/components/DocToc.vue'
import DocChildren from '@/components/DocChildren.vue'
import { useI18n } from '@/composables/useI18n'
import { docDir, getDoc, getNeighbors, slugFromPath } from '@/lib/content'
import { saveDocOverride, docOverrides } from '@/lib/doc-store'
import {
  reconnectWorkspace,
  serializeMarkdown,
  useWorkspaceFs,
  writeRepoFile,
  writeWorkspaceFile,
} from '@/lib/workspace-fs'
import { pushWorkspaceFile, useRemoteGit } from '@/lib/remote-git'
import { reindexDoc } from '@/lib/search'
import DocVisualEditor from '@/components/DocVisualEditor.vue'
import { Button } from '@/components/ui/button'
import { useRoles } from '@/composables/useRoles'
import { isOwnedSlug } from '@/lib/roles'
import { renderMarkdown, type TocItem } from '@/lib/markdown'
import { messages } from '@/i18n/messages'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { selected, ownedSlugs } = useRoles()
const { ready: fsReady, status: fsStatus } = useWorkspaceFs()
const { ready: remoteReady, autoPush } = useRemoteGit()

const slug = computed(() => slugFromPath(route.path))

const doc = computed(() => {
  void docOverrides.get(slug.value)
  return getDoc(slug.value)
})
const neighbors = computed(() => getNeighbors(slug.value))
const canEdit = computed(() => {
  if (!selected.value.length || !doc.value) return false
  if (doc.value.segments[0] === 'space') return true
  return isOwnedSlug(doc.value.slug, ownedSlugs.value)
})

const editing = ref(false)
const draft = ref('')
const saving = ref(false)
const saveMessage = ref('')
const visualEditor = ref<{ getMarkdown: () => string } | null>(null)

function startEdit() {
  if (!canEdit.value || !doc.value) return
  draft.value = doc.value.content
  editing.value = true
  saveMessage.value = ''
}

function cancelEdit() {
  editing.value = false
  draft.value = ''
  saveMessage.value = ''
}

async function saveEdit() {
  if (!canEdit.value || !doc.value) return
  saving.value = true
  saveMessage.value = ''
  try {
    if (fsStatus.value === 'need-permission') {
      await reconnectWorkspace()
    }
    if (!fsReady.value) {
      saveMessage.value = t.value('needWorkspace')
      return
    }
    const current = doc.value
    const body = visualEditor.value?.getMarkdown() ?? draft.value
    draft.value = body
    const fileText = serializeMarkdown(current, body)
    await writeWorkspaceFile(current.relPath, fileText)
    if (current.slug === 'space/harness/AGENT') {
      await writeRepoFile('AGENT.md', `${body.replace(/^\n+/, '')}\n`)
    }
    await saveDocOverride(current.slug, body)
    const updated = getDoc(current.slug)
    if (updated) reindexDoc(updated)
    editing.value = false
    if (remoteReady.value && autoPush.value) {
      try {
        await pushWorkspaceFile(current.relPath, fileText)
        saveMessage.value = t.value('saveOkRemote')
      } catch {
        saveMessage.value = t.value('saveRemoteFail')
      }
    } else {
      saveMessage.value = t.value('saveOk')
    }
    await load()
  } catch {
    saveMessage.value = fsReady.value ? t.value('settingsFail') : t.value('needWorkspace')
  } finally {
    saving.value = false
  }
}

const html = ref('')
const toc = ref<TocItem[]>([])
const activeId = ref('')
const loading = ref(true)
let loadGen = 0
let raf = 0
const HEADER_OFFSET = 88

async function load() {
  const gen = ++loadGen
  loading.value = true
  const current = doc.value
  if (!current) {
    if (gen !== loadGen) return
    html.value = ''
    toc.value = []
    activeId.value = ''
    loading.value = false
    return
  }
  const rendered = await renderMarkdown(current.content, docDir(current))
  if (gen !== loadGen) return
  html.value = rendered.html
  toc.value = rendered.toc
  loading.value = false
  await nextTick()
  if (route.hash) {
    const id = decodeURIComponent(route.hash.slice(1))
    document.getElementById(id)?.scrollIntoView()
  }
  updateActive()
}

function headingEls(): HTMLElement[] {
  return toc.value
    .map((item) => document.getElementById(item.id))
    .filter((el): el is HTMLElement => Boolean(el))
}

function updateActive() {
  const headings = headingEls()
  if (!headings.length) {
    activeId.value = ''
    return
  }

  const scrollBottom = window.scrollY + window.innerHeight
  const docHeight = document.documentElement.scrollHeight
  if (scrollBottom >= docHeight - 8) {
    activeId.value = headings[headings.length - 1]!.id
    return
  }

  let current = headings[0]!.id
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top - HEADER_OFFSET <= 0) current = heading.id
    else break
  }
  activeId.value = current
}

function onScroll() {
  if (raf) return
  raf = window.requestAnimationFrame(() => {
    raf = 0
    updateActive()
  })
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  activeId.value = id
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${id}`)
}

async function onContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const button = target?.closest('.copy-code') as HTMLButtonElement | null
  if (button) {
    const encoded = button.getAttribute('data-copy')
    if (!encoded) return
    await navigator.clipboard.writeText(decodeURIComponent(encoded))
    button.textContent = t.value('copied')
    window.setTimeout(() => {
      button.textContent = t.value('copy')
    }, 1200)
    return
  }

  const anchor = target?.closest('a') as HTMLAnchorElement | null
  if (!anchor || anchor.target === '_blank') return
  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return
  if (href.startsWith('/')) {
    event.preventDefault()
    void router.push(href)
  }
}

watch([slug, locale, () => docOverrides.get(slug.value)], () => {
  editing.value = false
  void load()
}, { immediate: true })

watch(
  () => doc.value?.title,
  (title) => {
    document.title = title ? `${title} · AGI-WorkSpace` : 'AGI-WorkSpace'
  },
  { immediate: true },
)

watch(html, async () => {
  await nextTick()
  document.querySelectorAll('.copy-code').forEach((btn) => {
    btn.textContent = messages[locale.value].copy
  })
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (raf) window.cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="flex">
    <div class="min-w-0 flex-1 px-6 py-8 md:px-10 lg:px-12">
      <Transition name="doc" mode="out-in">
        <article v-if="doc" :key="slug || 'home'" class="mx-auto max-w-3xl">
          <p v-if="doc.description" class="mb-2 text-sm text-muted-foreground">{{ doc.description }}</p>
          <h1 class="text-3xl font-semibold tracking-tight text-balance">{{ doc.title }}</h1>
          <p v-if="selected.length" class="mt-2 text-xs text-muted-foreground">
            {{ canEdit ? t('ownedBadge') : t('readOnlyBadge') }}
          </p>
          <p v-else class="mt-2 text-xs text-muted-foreground">
            <RouterLink to="/settings#roles" class="hover:underline">{{ t('pickRoleFirst') }}</RouterLink>
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button v-if="canEdit && !editing" size="sm" variant="outline" @click="startEdit">
              {{ t('editDoc') }}
            </Button>
            <template v-if="editing">
              <Button size="sm" :disabled="saving" @click="saveEdit">{{ t('saveDoc') }}</Button>
              <Button size="sm" variant="ghost" :disabled="saving" @click="cancelEdit">{{ t('cancelEdit') }}</Button>
              <RouterLink v-if="!fsReady" to="/settings" class="text-xs text-muted-foreground hover:underline">
                {{ t('settingsNav') }}
              </RouterLink>
            </template>
          </div>
          <p v-if="saveMessage" class="mt-2 text-xs text-muted-foreground">{{ saveMessage }}</p>
          <div class="mt-3 h-px w-full bg-border" />

          <DocVisualEditor
            v-if="editing"
            ref="visualEditor"
            v-model="draft"
            @save="saveEdit"
          />
          <div
            v-else-if="!loading"
            class="prose prose-docs mt-8 max-w-none prose-headings:scroll-mt-24"
            @click="onContentClick"
            v-html="html"
          />
          <div v-else class="mt-10 space-y-3">
            <div class="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div class="h-4 w-full animate-pulse rounded bg-muted" />
            <div class="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>

          <DocChildren v-if="doc.isIndex && !editing" :slug="slug" />

          <div class="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
            <RouterLink
              v-if="neighbors.prev"
              :to="neighbors.prev.slug ? `/${neighbors.prev.slug}` : '/'"
              class="group rounded-xl border bg-card p-4 transition-colors hover:bg-accent/60"
            >
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft class="size-3.5" />
                {{ t('previous') }}
              </div>
              <div class="mt-1 text-sm font-medium group-hover:text-foreground">{{ neighbors.prev.title }}</div>
            </RouterLink>
            <div v-else />
            <RouterLink
              v-if="neighbors.next"
              :to="neighbors.next.slug ? `/${neighbors.next.slug}` : '/'"
              class="group rounded-xl border bg-card p-4 text-right transition-colors hover:bg-accent/60"
            >
              <div class="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                {{ t('next') }}
                <ArrowRight class="size-3.5" />
              </div>
              <div class="mt-1 text-sm font-medium">{{ neighbors.next.title }}</div>
            </RouterLink>
          </div>
        </article>
        <article v-else :key="'missing'" class="mx-auto max-w-3xl py-16">
          <h1 class="text-2xl font-semibold">{{ t('notFound') }}</h1>
          <p class="mt-2 text-muted-foreground">{{ t('notFoundHint') }}</p>
        </article>
      </Transition>
    </div>
    <aside class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 pr-6 lg:block scrollbar-thin">
      <DocToc
        :items="toc"
        :active-id="activeId"
        :title="t('onThisPage')"
        @select="scrollToHeading"
      />
    </aside>
  </div>
</template>
