<template>
  <div class="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-2xl">
    <div class="flex border-b border-gray-200 bg-gray-50 pt-2 px-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'py-3 px-6 bg-transparent border-0 border-b-2 cursor-pointer font-medium text-slate-500 transition-all text-sm -mb-px',
          activeTab === tab.id
            ? 'text-indigo-500 border-b-indigo-500 bg-white'
            : 'border-transparent hover:text-slate-700 hover:bg-indigo-500/5'
        ]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex justify-between items-center py-3 px-4 bg-slate-50 border-b border-gray-200">
        <span class="font-mono text-sm text-slate-600 font-medium">{{ currentTab?.fileName }}</span>
        <div class="flex gap-2">
          <button @click="copyCode" class="flex items-center gap-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md cursor-pointer text-[0.8125rem] text-slate-500 transition-all hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700" title="Copy code">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          <button @click="downloadCode" class="flex items-center gap-1.5 py-2 px-3 bg-white border border-gray-200 rounded-md cursor-pointer text-[0.8125rem] text-slate-500 transition-all hover:bg-slate-100 hover:border-slate-300 hover:text-slate-700" title="Download file">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>
      </div>

      <pre class="m-0 p-6 overflow-y-auto overflow-x-auto bg-slate-800 text-gray-200 font-mono text-sm leading-relaxed max-h-[900px] scrollbar-custom"><code class="whitespace-pre">{{ currentCode }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Tab {
  id: string
  label: string
  fileName: string
  code: string
}

const props = defineProps<{
  componentCode: string
  templateCode: string
}>()

const activeTab = ref<string>('component')
const copied = ref(false)

const tabs: Tab[] = [
  {
    id: 'component',
    label: 'Component',
    fileName: 'component.tsx',
    code: props.componentCode
  },
  {
    id: 'template',
    label: 'Template',
    fileName: 'template.tsx',
    code: props.templateCode
  }
]

const currentTab = computed(() => tabs.find(tab => tab.id === activeTab.value))
const currentCode = computed(() => currentTab.value?.code || '')

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(currentCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code:', err)
  }
}

const downloadCode = () => {
  const blob = new Blob([currentCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = currentTab.value?.fileName || 'code.tsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: #0f172a;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
