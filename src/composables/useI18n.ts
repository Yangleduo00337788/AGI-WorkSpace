import { computed, ref } from 'vue'
import { messages, type Locale, type MessageKey } from '@/i18n/messages'

const STORAGE_KEY = 'agi-locale'

function readLocale(): Locale {
  if (typeof localStorage === 'undefined') return 'zh'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'zh'
}

const locale = ref<Locale>(readLocale())

export function useI18n() {
  const t = computed(() => {
    const table = messages[locale.value]
    return (key: MessageKey) => table[key]
  })

  function setLocale(next: Locale) {
    locale.value = next
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
  }

  return { locale, t, setLocale }
}
