<template>
  <div class="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden shadow-xl max-h-full">
    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 text-center flex-shrink-0">
      <h1 class="m-0 mb-2 text-3xl font-bold">{{ headerTitle }}</h1>
      <p class="m-0 opacity-90 text-sm">{{ headerSubtitle }}</p>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden p-8 flex flex-col gap-4 min-h-0" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['flex animate-[fadeIn_0.3s_ease-in]', msg.sender === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div :class="['flex gap-3 max-w-[70%] items-start', msg.sender === 'user' ? 'flex-row-reverse' : '']">
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0 bg-white shadow-md">
            <span v-if="msg.sender === 'user'">👤</span>
            <span v-else>🤖</span>
          </div>
          <div
            :class="[
              'py-3.5 px-4 rounded-xl leading-relaxed break-words max-w-full whitespace-pre-line',
              msg.sender === 'user'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm shadow-md'
            ]"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-start animate-[fadeIn_0.3s_ease-in]">
        <div class="flex gap-3 max-w-[70%] items-start">
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0 bg-white shadow-md">🤖</div>
          <div class="py-3.5 px-4 rounded-xl leading-relaxed bg-white text-gray-800 rounded-bl-sm shadow-md">
            <div class="flex gap-1 py-1">
              <span class="w-2 h-2 rounded-full bg-gray-400 animate-[typing_1.4s_infinite]"></span>
              <span class="w-2 h-2 rounded-full bg-gray-400 animate-[typing_1.4s_infinite_0.2s]"></span>
              <span class="w-2 h-2 rounded-full bg-gray-400 animate-[typing_1.4s_infinite_0.4s]"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6 bg-white border-t border-gray-200 flex-shrink-0">
      <div v-if="selectedImage" class="relative mb-3 max-w-[200px] rounded-lg overflow-hidden shadow-md">
        <img :src="selectedImage" alt="Selected form image" class="w-full h-auto block" />
        <button @click="clearImage" class="absolute top-2 right-2 w-7 h-7 rounded-full border-0 bg-black/70 text-white cursor-pointer flex items-center justify-center transition-colors hover:bg-black/90" title="Remove image">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="flex gap-3 items-end">
        <input
          type="file"
          ref="fileInput"
          @change="handleImageSelect"
          accept="image/*"
          class="hidden"
        />
        <button
          @click="() => fileInput?.click()"
          :disabled="isLoading"
          class="w-11 h-11 rounded-xl border-2 border-gray-200 bg-white text-indigo-500 cursor-pointer flex items-center justify-center transition-all flex-shrink-0 hover:border-indigo-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload form image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        <textarea
          v-model="userInput"
          @keydown.enter.prevent="handleSubmit"
          placeholder="Type 'create a form...' or upload an image 📷"
          rows="1"
          :disabled="isLoading"
          class="flex-1 py-3.5 px-4 border-2 border-gray-200 rounded-xl font-inherit text-[0.95rem] resize-none transition-colors min-h-[44px] max-h-[120px] focus:outline-none focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        ></textarea>
        <button
          @click="handleSubmit"
          :disabled="(!userInput.trim() && !selectedImage) || isLoading"
          class="w-11 h-11 rounded-xl border-0 bg-gradient-to-br from-indigo-500 to-purple-600 text-white cursor-pointer flex items-center justify-center transition-transform flex-shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div v-if="error" class="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'

interface Message {
  text: string
  sender: 'user' | 'assistant'
}

const emit = defineEmits<{
  formGenerated: [message: string, image?: string]
}>()

interface Props {
  isLoading: boolean
  error: string | null
  mode?: 'form' | 'component'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'form'
})

const headerTitle = computed(() => {
  return props.mode === 'component'
    ? 'Custom Component Generator'
    : 'AI Form Generator'
})

const headerSubtitle = computed(() => {
  return props.mode === 'component'
    ? 'Describe your custom component to generate React code'
    : 'Describe your form in plain English'
})

const welcomeMessage = computed(() => {
  if (props.mode === 'component') {
    return 'Hello! I can help you generate custom Form.io components.\n\n• Describe the component you want to create\n• Get production-ready component.tsx and template.tsx files\n• Copy or download the generated code\n\nTry: "Create a slider component" or "Make a star rating component"'
  }
  return 'Hello! I can help you generate forms.\n\n• Just say "create", "make", "build", or describe what you need\n• Upload images using the 📷 button\n• Say "improve design" or "change colors" to modify forms\n\nTry: "create contact form" or "make login form with blue theme"'
})

const messages = ref<Message[]>([
  {
    text: welcomeMessage.value,
    sender: 'assistant',
  },
])

watch(() => props.mode, () => {
  const firstMessage = messages.value[0]
  if (firstMessage) {
    firstMessage.text = welcomeMessage.value
  }
})

const userInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedImage = ref<string | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const addMessage = (text: string, sender: 'user' | 'assistant') => {
  messages.value.push({ text, sender })
  scrollToBottom()
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  selectedImage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = () => {
  if ((!userInput.value.trim() && !selectedImage.value) || props.isLoading) return

  const message = userInput.value.trim() || 'Generate a form from this image'
  addMessage(message + (selectedImage.value ? ' 📷' : ''), 'user')

  emit('formGenerated', message, selectedImage.value || undefined)

  userInput.value = ''
  clearImage()
}

const addAssistantMessage = (text: string) => {
  addMessage(text, 'assistant')
}

const getConversationHistory = (): Array<{ role: 'user' | 'assistant'; content: string }> => {
  return messages.value
    .slice(1)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text.replace(' 📷', '')
    }))
}

defineExpose({
  addAssistantMessage,
  getConversationHistory,
})
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
</style>
