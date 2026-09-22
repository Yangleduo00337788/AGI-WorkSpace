<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { editableHtmlToMarkdown, markdownToEditableHtml } from '@/lib/html-markdown'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: []
}>()

const { t } = useI18n()
const editor = ref<HTMLElement | null>(null)

function syncFromMarkdown(source: string) {
  if (!editor.value) return
  editor.value.innerHTML = markdownToEditableHtml(source) || '<p></p>'
}

function currentMarkdown() {
  return editor.value ? editableHtmlToMarkdown(editor.value.innerHTML) : props.modelValue
}

function emitMarkdown() {
  emit('update:modelValue', currentMarkdown())
}

function run(command: string, value?: string) {
  editor.value?.focus()
  document.execCommand(command, false, value)
  emitMarkdown()
}

function setBlock(tag: string) {
  run('formatBlock', tag)
}

function insertTable() {
  run(
    'insertHTML',
    '<div class="table-wrap"><table><thead><tr><th>列 1</th><th>列 2</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table></div><p></p>',
  )
}

function insertLink() {
  const href = window.prompt(t.value('fmtLinkPrompt'), 'https://')
  if (!href) return
  run('createLink', href)
}

function onEditorClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('a')) event.preventDefault()
}

onMounted(() => {
  syncFromMarkdown(props.modelValue)
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    if (document.activeElement === editor.value) return
    if (currentMarkdown() === value) return
    syncFromMarkdown(value)
  },
)

defineExpose({
  getMarkdown: currentMarkdown,
  focus: () => editor.value?.focus(),
})
</script>

<template>
  <div class="mt-6">
    <div class="flex flex-wrap gap-1 rounded-xl border bg-muted/40 p-1.5">
      <Button type="button" size="sm" variant="ghost" @click="setBlock('h2')">{{ t('fmtHeading2') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="setBlock('h3')">{{ t('fmtHeading3') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="setBlock('p')">{{ t('fmtParagraph') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="run('bold')">{{ t('fmtBold') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="run('italic')">{{ t('fmtItalic') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="run('insertUnorderedList')">{{ t('fmtList') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="run('insertOrderedList')">{{ t('fmtOrdered') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="run('formatBlock', 'blockquote')">{{ t('fmtQuote') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="insertTable">{{ t('fmtTable') }}</Button>
      <Button type="button" size="sm" variant="ghost" @click="insertLink">{{ t('fmtLink') }}</Button>
    </div>
    <p class="mt-2 text-xs text-muted-foreground">{{ t('editHint') }}</p>
    <div
      ref="editor"
      class="prose prose-docs editor-surface mt-4 max-w-none rounded-xl border bg-background px-6 py-5 outline-none prose-headings:scroll-mt-24"
      contenteditable="true"
      spellcheck="false"
      @input="emitMarkdown"
      @click="onEditorClick"
      @keydown.ctrl.s.prevent="emit('save')"
      @keydown.meta.s.prevent="emit('save')"
    />
  </div>
</template>
