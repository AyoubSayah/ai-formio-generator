import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Load messages from localStorage
  const loadMessages = () => {
    const saved = localStorage.getItem('chat_messages')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        messages.value = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      } catch (error) {
        console.error('Failed to load chat messages:', error)
      }
    }
  }

  // Save messages to localStorage (keep last 50)
  const saveMessages = () => {
    const toSave = messages.value.slice(-50)
    localStorage.setItem('chat_messages', JSON.stringify(toSave))
  }

  // Actions
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: message.text,
      sender: message.sender,
      timestamp: new Date(),
    }
    messages.value.push(newMessage)
    saveMessages()
  }

  const clearMessages = () => {
    messages.value = []
    localStorage.removeItem('chat_messages')
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // Getters
  const sortedMessages = computed(() => {
    return [...messages.value].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )
  })

  const userMessages = computed(() => {
    return messages.value.filter((msg) => msg.sender === 'user')
  })

  const assistantMessages = computed(() => {
    return messages.value.filter((msg) => msg.sender === 'assistant')
  })

  const conversationHistory = computed(() => {
    return messages.value.map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }))
  })

  // Initialize
  loadMessages()

  return {
    // State
    messages,
    isLoading,
    error,
    // Actions
    addMessage,
    clearMessages,
    setLoading,
    setError,
    // Getters
    sortedMessages,
    userMessages,
    assistantMessages,
    conversationHistory,
  }
})
