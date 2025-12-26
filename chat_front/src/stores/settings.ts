import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const theme = ref<Theme>('system')
  const apiUrl = ref('http://localhost:3000')
  const autoSave = ref(true)
  const showCodeEditor = ref(false)

  // Load from localStorage on initialization
  const loadSettings = () => {
    const saved = localStorage.getItem('settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        theme.value = parsed.theme || 'system'
        apiUrl.value = parsed.apiUrl || 'http://localhost:3000'
        autoSave.value = parsed.autoSave !== undefined ? parsed.autoSave : true
        showCodeEditor.value = parsed.showCodeEditor || false
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }

  // Save to localStorage whenever settings change
  const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify({
      theme: theme.value,
      apiUrl: apiUrl.value,
      autoSave: autoSave.value,
      showCodeEditor: showCodeEditor.value,
    }))
  }

  // Actions
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    saveSettings()
  }

  const toggleTheme = () => {
    if (theme.value === 'light') {
      theme.value = 'dark'
    } else if (theme.value === 'dark') {
      theme.value = 'system'
    } else {
      theme.value = 'light'
    }
    saveSettings()
  }

  const setApiUrl = (url: string) => {
    apiUrl.value = url
    saveSettings()
  }

  const toggleAutoSave = () => {
    autoSave.value = !autoSave.value
    saveSettings()
  }

  const toggleCodeEditor = () => {
    showCodeEditor.value = !showCodeEditor.value
    saveSettings()
  }

  // Watch for changes and persist
  watch([theme, apiUrl, autoSave, showCodeEditor], saveSettings)

  // Initialize
  loadSettings()

  return {
    // State
    theme,
    apiUrl,
    autoSave,
    showCodeEditor,
    // Actions
    setTheme,
    toggleTheme,
    setApiUrl,
    toggleAutoSave,
    toggleCodeEditor,
  }
})
