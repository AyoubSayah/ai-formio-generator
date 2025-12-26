<template>
  <div class="h-screen bg-gradient-to-br from-indigo-500 to-purple-700 p-8 w-full overflow-hidden">
    <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-[calc(100vh-4rem)]">
      <div class="flex flex-col min-h-0 h-full gap-4">
        <div class="flex gap-2 bg-white/95 p-2 rounded-xl shadow-2xl">
          <button
            :class="[
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 border-0 rounded-lg cursor-pointer font-medium text-sm text-slate-500 transition-all',
              mode === 'form'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-lg shadow-indigo-500/40'
                : 'bg-transparent hover:bg-indigo-500/10 hover:text-indigo-600'
            ]"
            @click="mode = 'form'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Form Generator
          </button>
          <button
            :class="[
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 border-0 rounded-lg cursor-pointer font-medium text-sm text-slate-500 transition-all',
              mode === 'component'
                ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-lg shadow-indigo-500/40'
                : 'bg-transparent hover:bg-indigo-500/10 hover:text-indigo-600'
            ]"
            @click="mode = 'component'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Custom Component
          </button>
        </div>

        <ChatInterface
          ref="chatInterface"
          :is-loading="loading"
          :error="error"
          :mode="mode"
          @form-generated="handleFormGeneration"
        />
      </div>

      <div class="flex flex-col min-h-0 h-full gap-4">
        <div v-if="mode === 'form'">
          <div v-if="!generatedForm" class="flex-1 bg-white rounded-xl flex items-center justify-center shadow-2xl">
            <div class="text-center text-gray-400 p-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="block mx-auto mb-6 opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h3 class="text-2xl m-0 mb-3 text-gray-700">AI Form Generator</h3>
              <p class="text-base m-0 mb-6 text-gray-600">Describe your form in the chat to see a live preview here</p>
              <div class="flex flex-col gap-2 items-center">
                <span class="inline-block py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-600 font-medium">Try: "Create a contact form"</span>
                <span class="inline-block py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-600 font-medium">Try: "Make a login form with blue theme"</span>
                <span class="inline-block py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-600 font-medium">Try: Upload a form image 📷</span>
              </div>
            </div>
          </div>

          <FormRenderer v-else :schema="generatedForm" :css="generatedCss" @submit="handleFormSubmit" />
        </div>

        <div v-else>
          <div v-if="!generatedComponent" class="flex-1 bg-white rounded-xl flex items-center justify-center shadow-2xl">
            <div class="text-center text-gray-400 p-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="block mx-auto mb-6 opacity-50">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <h3 class="text-2xl m-0 mb-3 text-gray-700">Generate Custom Form.io Component</h3>
              <p class="text-base m-0 mb-6 text-gray-600">Describe your custom React component and get production-ready code</p>
              <div class="flex flex-col gap-2 items-center">
                <span class="inline-block py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-600 font-medium">Try: "Create a slider component"</span>
                <span class="inline-block py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-600 font-medium">Try: "Make a star rating component"</span>
                <span class="inline-block py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-600 font-medium">Try: "Build a color picker"</span>
              </div>
            </div>
          </div>

          <CodeViewer v-else :componentCode="generatedComponent.componentCode" :templateCode="generatedComponent.templateCode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChatInterface from '@/components/chat/ChatInterface.vue'
import FormRenderer from '@/components/forms/FormRenderer.vue'
import CodeViewer from '@/components/code/CodeViewer.vue'
import { useFormGenerator } from '@/composables/useFormGenerator'
import type { FormSchema } from '@/composables/useFormGenerator'

const { generateForm, sendChatMessage, generateCustomComponent, loading, error } = useFormGenerator()

const mode = ref<'form' | 'component'>('form')
const chatInterface = ref<InstanceType<typeof ChatInterface> | null>(null)
const generatedForm = ref<FormSchema | null>(null)
const generatedCss = ref<string | null>(null)
const generatedComponent = ref<{ componentCode: string; templateCode: string } | null>(null)

const shouldGenerateForm = (message: string, hasImage: boolean): boolean => {
  if (hasImage) return true

  const lowerMessage = message.toLowerCase().trim()

  // Action keywords that trigger form generation
  const actionKeywords = [
    'create', 'make', 'build', 'generate', 'design',
    'improve', 'modify', 'update', 'change', 'edit',
    'add', 'remove', 'style', 'customize'
  ]

  // Exclude common chat phrases
  const excludeKeywords = ['hello', 'hi', 'hey', 'help', 'what', 'how are you']

  // If it's a simple greeting or help request, don't generate
  if (excludeKeywords.some(keyword => lowerMessage === keyword || lowerMessage.startsWith(keyword + ' '))) {
    return false
  }

  // Check if message contains any action keyword
  return actionKeywords.some(keyword => lowerMessage.includes(keyword))
}

const handleFormGeneration = async (message: string, image?: string) => {
  const hasImage = !!image

  // In component mode, always generate component (no chat fallback)
  if (mode.value === 'component') {
    const conversationHistory = chatInterface.value?.getConversationHistory() || []
    const response = await generateCustomComponent(message, conversationHistory)

    if (response && response.success && response.componentCode && response.templateCode) {
      generatedComponent.value = {
        componentCode: response.componentCode,
        templateCode: response.templateCode
      }
      chatInterface.value?.addAssistantMessage(response.message)
    } else {
      chatInterface.value?.addAssistantMessage(
        response?.message || 'Sorry, I could not generate the custom component. Please try again.'
      )
    }
    return
  }

  // Form mode logic
  // Check if we should generate a form or just chat
  if (!shouldGenerateForm(message, hasImage)) {
    // Just chat, don't generate form
    const chatResponse = await sendChatMessage(message)
    if (chatResponse && chatResponse.success) {
      chatInterface.value?.addAssistantMessage(chatResponse.message)
    } else {
      chatInterface.value?.addAssistantMessage('Sorry, something went wrong.')
    }
    return
  }

  // Build conversation history from chat messages
  const conversationHistory = chatInterface.value?.getConversationHistory() || []

  // Generate form with conversation context
  const response = await generateForm(message, conversationHistory, image)

  if (response && response.success && response.formSchema) {
    generatedForm.value = response.formSchema
    generatedCss.value = response.css || null
    chatInterface.value?.addAssistantMessage(response.message)
  } else {
    chatInterface.value?.addAssistantMessage(
      response?.message || 'Sorry, I could not generate the form. Please try again.'
    )
  }
}

const handleFormSubmit = (data: any) => {
  console.log('Form submitted:', data)
  chatInterface.value?.addAssistantMessage(
    'Form submitted successfully! ' + JSON.stringify(data, null, 2)
  )
}
</script>

