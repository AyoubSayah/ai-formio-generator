import { watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useTheme() {
  const settingsStore = useSettingsStore()

  const applyTheme = () => {
    const root = document.documentElement

    // Remove both classes first
    root.classList.remove('light', 'dark')

    if (settingsStore.theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark' : 'light')
    } else {
      // Use user preference
      root.classList.add(settingsStore.theme)
    }
  }

  // Watch for theme changes
  watch(() => settingsStore.theme, applyTheme)

  // Watch for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    if (settingsStore.theme === 'system') {
      applyTheme()
    }
  }

  onMounted(() => {
    applyTheme()
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  })

  return {
    theme: settingsStore.theme,
    setTheme: settingsStore.setTheme,
    toggleTheme: settingsStore.toggleTheme,
  }
}
