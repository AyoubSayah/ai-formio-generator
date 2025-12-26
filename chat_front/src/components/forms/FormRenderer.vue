<template>
  <div class="w-full h-full flex flex-col">
    <div v-if="schema" class="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-2xl">
      <div class="flex gap-0 bg-gray-50 border-b-2 border-gray-200 px-4">
        <button
          :class="[
            'py-4 px-6 border-0 bg-transparent text-gray-600 text-[0.95rem] font-medium cursor-pointer border-b-[3px] border-transparent -mb-0.5 transition-all',
            activeTab === 'preview' ? 'text-indigo-500 border-b-indigo-500 bg-white' : 'hover:text-gray-700 hover:bg-gray-100'
          ]"
          @click="activeTab = 'preview'"
        >
          Preview
        </button>
        <button
          :class="[
            'py-4 px-6 border-0 bg-transparent text-gray-600 text-[0.95rem] font-medium cursor-pointer border-b-[3px] border-transparent -mb-0.5 transition-all',
            activeTab === 'json' ? 'text-indigo-500 border-b-indigo-500 bg-white' : 'hover:text-gray-700 hover:bg-gray-100'
          ]"
          @click="activeTab = 'json'"
        >
          JSON Schema
        </button>
        <button
          v-if="cssCode"
          :class="[
            'py-4 px-6 border-0 bg-transparent text-gray-600 text-[0.95rem] font-medium cursor-pointer border-b-[3px] border-transparent -mb-0.5 transition-all',
            activeTab === 'css' ? 'text-indigo-500 border-b-indigo-500 bg-white' : 'hover:text-gray-700 hover:bg-gray-100'
          ]"
          @click="activeTab = 'css'"
        >
          CSS Styles
        </button>
      </div>

      <div v-show="activeTab === 'preview'" class="flex-1 overflow-y-auto p-8">
        <h2 class="m-0 mb-6 text-[1.75rem] font-semibold text-gray-800">{{ schema.title }}</h2>
        <div ref="formioContainer"></div>
      </div>

      <div v-show="activeTab === 'json'" class="flex-1 overflow-y-auto p-6 bg-[#1e1e1e]">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-[#3a3a3a]">
          <h3 class="m-0 text-gray-200 text-[1.1rem] font-semibold">Form.io JSON Schema</h3>
          <button @click="copyToClipboard(jsonCode, 'JSON')" class="flex items-center gap-2 py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-600 hover:border-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copiedType === 'JSON' ? 'Copied!' : 'Copy JSON' }}
          </button>
        </div>
        <pre class="m-0 p-6 bg-[#0d1117] rounded-lg overflow-x-auto font-mono text-sm leading-relaxed text-[#c9d1d9] max-h-[900px] max-w-[600px]"><code>{{ jsonCode }}</code></pre>
      </div>

      <div v-if="cssCode" v-show="activeTab === 'css'" class="flex-1 overflow-y-auto p-6 bg-[#1e1e1e]">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-[#3a3a3a]">
          <h3 class="m-0 text-gray-200 text-[1.1rem] font-semibold">Custom CSS Styles</h3>
          <button @click="copyToClipboard(cssCode, 'CSS')" class="flex items-center gap-2 py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-md cursor-pointer text-sm transition-all hover:bg-gray-600 hover:border-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copiedType === 'CSS' ? 'Copied!' : 'Copy CSS' }}
          </button>
        </div>
        <pre class="m-0 p-6 bg-[#0d1117] rounded-lg overflow-x-auto font-mono text-sm leading-relaxed text-[#c9d1d9] max-h-[900px] max-w-[600px]"><code>{{ cssCode }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Formio } from 'formiojs'
import type { FormSchema } from '@/composables/useFormGenerator'

interface Props {
  schema: FormSchema | null
  css?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: any]
}>()

const formioContainer = ref<HTMLElement | null>(null)
const activeTab = ref<'preview' | 'json' | 'css'>('preview')
const copiedType = ref<string | null>(null)
let formInstance: any = null
let styleElement: HTMLStyleElement | null = null

const jsonCode = computed(() => {
  return props.schema ? JSON.stringify(props.schema, null, 2) : ''
})

const cssCode = computed(() => {
  return props.css || null
})

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedType.value = type
    setTimeout(() => {
      copiedType.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const injectCSS = () => {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }

  if (props.css) {
    styleElement = document.createElement('style')
    styleElement.setAttribute('data-formio-custom-css', 'true')
    styleElement.textContent = props.css
    document.head.appendChild(styleElement)
  }
}

const renderForm = async () => {
  if (!formioContainer.value || !props.schema) return

  if (formInstance) {
    formInstance.destroy()
  }

  formioContainer.value.innerHTML = ''

  await nextTick()

  formInstance = await Formio.createForm(formioContainer.value, props.schema)

  formInstance.on('submit', (submission: any) => {
    emit('submit', submission.data)
  })

  injectCSS()
}

watch(() => props.schema, renderForm, { deep: true })
watch(() => props.css, injectCSS)

onMounted(() => {
  if (props.schema) {
    renderForm()
  }
})

onUnmounted(() => {
  // Clean up style element when component is destroyed
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
})
</script>

<style scoped>
:deep(.formio-form) {
  font-family: inherit;
}

:deep(.btn-primary) {
  background-color: #42b983;
  border-color: #42b983;
}

:deep(.btn-primary:hover) {
  background-color: #3aa876;
  border-color: #3aa876;
}
</style>
