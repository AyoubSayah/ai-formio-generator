// Simple toast implementation without dependencies
// In a real app, you'd use a library like vue-sonner or create a more robust toast system

import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])

let toastId = 0

const addToast = (message: string, type: Toast['type'], duration = 5000) => {
  const id = `toast-${toastId++}`
  const toast: Toast = { id, message, type, duration }

  toasts.value.push(toast)

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id)
  }, duration)

  return id
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  const toast = {
    success: (message: string, duration?: number) => {
      return addToast(message, 'success', duration)
    },
    error: (message: string, duration?: number) => {
      return addToast(message, 'error', duration)
    },
    warning: (message: string, duration?: number) => {
      return addToast(message, 'warning', duration)
    },
    info: (message: string, duration?: number) => {
      return addToast(message, 'info', duration)
    },
    dismiss: (id: string) => {
      removeToast(id)
    },
  }

  return {
    toast,
    toasts,
  }
}
