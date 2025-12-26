import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [Ref<T>, (value: T) => void] {
  // Try to load from localStorage
  const storedValue = localStorage.getItem(key)
  let initialValue: T

  if (storedValue) {
    try {
      initialValue = JSON.parse(storedValue)
    } catch {
      initialValue = defaultValue
    }
  } else {
    initialValue = defaultValue
  }

  const value = ref<T>(initialValue) as Ref<T>

  // Watch for changes and persist
  watch(
    value,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`Failed to save to localStorage (${key}):`, error)
      }
    },
    { deep: true }
  )

  const setValue = (newValue: T) => {
    value.value = newValue
  }

  return [value, setValue]
}
