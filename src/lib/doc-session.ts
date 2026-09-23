import { ref } from 'vue'

/** 侧栏点「编辑」后，文档页据此进入编辑态 */
export const pendingEditSlug = ref<string | null>(null)
