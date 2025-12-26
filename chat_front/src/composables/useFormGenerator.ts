import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export interface FormSchema {
  display: string
  components: any[]
  title: string
  [key: string]: any
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface FormGenerationResponse {
  formSchema: FormSchema | null
  css?: string | null
  message: string
  success: boolean
  metadata?: {
    generationTime?: number
    componentCount?: number
    model?: string
  }
}

export function useFormGenerator() {
  const settingsStore = useSettingsStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const abortController = ref<AbortController | null>(null)

  const sendChatMessage = async (message: string): Promise<{ message: string; success: boolean } | null> => {
    try {
      const response = await fetch(`${settingsStore.apiUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to send message'
      return null
    }
  }

  const generateForm = async (
    message: string,
    conversationHistory?: ConversationMessage[],
    image?: string,
    retries = 3
  ): Promise<FormGenerationResponse | null> => {
    loading.value = true
    error.value = null
    abortController.value = new AbortController()

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${settingsStore.apiUrl}/chat/generate-form`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            conversationHistory,
            image,
          }),
          signal: abortController.value.signal,
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle specific HTTP errors
          if (response.status === 408) {
            throw new Error('Request timeout - please try a simpler description')
          }
          if (response.status === 429) {
            throw new Error('Too many requests - please wait a moment')
          }
          if (response.status === 500) {
            throw new Error(data.message || 'Server error - please try again')
          }
          throw new Error(data.message || 'Failed to generate form')
        }

        loading.value = false
        return data
      } catch (err: any) {
        lastError = err

        // Don't retry if request was cancelled
        if (err.name === 'AbortError') {
          error.value = 'Request cancelled'
          loading.value = false
          return null
        }

        // Don't retry on certain errors
        if (err.message.includes('timeout') || err.message.includes('Too many requests')) {
          error.value = err.message
          loading.value = false
          return null
        }

        // If not the last attempt, wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 1000 // 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // All retries exhausted
    error.value = lastError?.message || 'Failed to generate form after multiple attempts'
    loading.value = false
    return null
  }

  const cancelGeneration = () => {
    if (abortController.value) {
      abortController.value.abort()
      loading.value = false
    }
  }

  const generateCustomComponent = async (
    message: string,
    conversationHistory?: ConversationMessage[],
  ): Promise<{ componentCode: string; templateCode: string; message: string; success: boolean } | null> => {
    loading.value = true
    error.value = null
    abortController.value = new AbortController()

    try {
      const response = await fetch(`${settingsStore.apiUrl}/chat/generate-custom-component`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
        signal: abortController.value.signal,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate custom component')
      }

      loading.value = false
      return data
    } catch (err: any) {
      if (err.name === 'AbortError') {
        error.value = 'Request cancelled'
      } else {
        error.value = err.message || 'Failed to generate custom component'
      }
      loading.value = false
      return null
    }
  }

  return {
    loading,
    error,
    generateForm,
    sendChatMessage,
    cancelGeneration,
    generateCustomComponent,
  }
}
