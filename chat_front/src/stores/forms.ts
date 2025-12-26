import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FormSchema {
  display: string
  components: any[]
  title: string
  [key: string]: any
}

export interface FormHistoryItem {
  id: string
  schema: FormSchema
  createdAt: Date
  updatedAt: Date
  userPrompt: string
  title: string
  version: number
}

export const useFormsStore = defineStore('forms', () => {
  // State
  const currentForm = ref<FormSchema | null>(null)
  const formHistory = ref<FormHistoryItem[]>([])
  const formVersions = ref<Map<string, FormSchema[]>>(new Map())

  // Load from localStorage
  const loadForms = () => {
    // Load current form
    const savedCurrent = localStorage.getItem('current_form')
    if (savedCurrent) {
      try {
        currentForm.value = JSON.parse(savedCurrent)
      } catch (error) {
        console.error('Failed to load current form:', error)
      }
    }

    // Load history
    const savedHistory = localStorage.getItem('form_history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        formHistory.value = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }))
      } catch (error) {
        console.error('Failed to load form history:', error)
      }
    }
  }

  // Save to localStorage
  const saveCurrent = () => {
    if (currentForm.value) {
      localStorage.setItem('current_form', JSON.stringify(currentForm.value))
    } else {
      localStorage.removeItem('current_form')
    }
  }

  const saveHistory = () => {
    localStorage.setItem('form_history', JSON.stringify(formHistory.value))
  }

  // Actions
  const setCurrentForm = (schema: FormSchema, prompt: string) => {
    currentForm.value = schema
    saveCurrent()

    // Also save to history
    saveToHistory(schema, prompt)
  }

  const saveToHistory = (schema: FormSchema, prompt: string) => {
    const existingIndex = formHistory.value.findIndex(
      (item) => item.title === schema.title && item.userPrompt === prompt
    )

    if (existingIndex !== -1) {
      // Update existing item
      const existingItem = formHistory.value[existingIndex]
      if (existingItem) {
        existingItem.schema = schema
        existingItem.updatedAt = new Date()
        existingItem.version += 1
      }
    } else {
      // Create new item
      const newItem: FormHistoryItem = {
        id: crypto.randomUUID(),
        schema,
        createdAt: new Date(),
        updatedAt: new Date(),
        userPrompt: prompt,
        title: schema.title || 'Untitled Form',
        version: 1,
      }
      formHistory.value.unshift(newItem)
    }

    // Keep only last 100 items
    if (formHistory.value.length > 100) {
      formHistory.value = formHistory.value.slice(0, 100)
    }

    saveHistory()
  }

  const loadFromHistory = (id: string) => {
    const item = formHistory.value.find((i) => i.id === id)
    if (item) {
      currentForm.value = item.schema
      saveCurrent()
    }
  }

  const deleteFromHistory = (id: string) => {
    formHistory.value = formHistory.value.filter((i) => i.id !== id)
    saveHistory()

    // Also remove from versions
    formVersions.value.delete(id)
  }

  const exportForm = (id: string, format: 'json' | 'yaml' | 'typescript') => {
    const item = formHistory.value.find((i) => i.id === id)
    if (!item) return null

    switch (format) {
      case 'json':
        return JSON.stringify(item.schema, null, 2)
      case 'yaml':
        // Simple YAML conversion
        return convertToYAML(item.schema)
      case 'typescript':
        return generateTypeScriptInterface(item.schema)
      default:
        return null
    }
  }

  const duplicateForm = (id: string) => {
    const item = formHistory.value.find((i) => i.id === id)
    if (!item) return

    const duplicated: FormHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      title: `${item.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    }

    formHistory.value.unshift(duplicated)
    saveHistory()
  }

  const createVersion = (formId: string) => {
    const item = formHistory.value.find((i) => i.id === formId)
    if (!item) return

    const versions = formVersions.value.get(formId) || []
    versions.push({ ...item.schema })
    formVersions.value.set(formId, versions)
  }

  const clearHistory = () => {
    formHistory.value = []
    localStorage.removeItem('form_history')
  }

  // Getters
  const recentForms = computed(() => {
    return formHistory.value.slice(0, 10)
  })

  const formById = computed(() => {
    return (id: string) => formHistory.value.find((i) => i.id === id)
  })

  const versionsForForm = computed(() => {
    return (formId: string) => formVersions.value.get(formId) || []
  })

  // Helper functions
  const convertToYAML = (obj: any, indent = 0): string => {
    const spaces = ' '.repeat(indent)
    let yaml = ''

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 2)}`
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`
        value.forEach((item) => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${convertToYAML(item, indent + 4)}`
          } else {
            yaml += `${spaces}  - ${item}\n`
          }
        })
      } else {
        yaml += `${spaces}${key}: ${value}\n`
      }
    }

    return yaml
  }

  const generateTypeScriptInterface = (schema: FormSchema): string => {
    let typescript = `interface ${schema.title.replace(/\s+/g, '')}Form {\n`

    schema.components.forEach((component: any) => {
      if (component.type === 'button') return

      const optional = !component.validate?.required ? '?' : ''
      let type = 'any'

      switch (component.type) {
        case 'textfield':
        case 'textarea':
        case 'email':
        case 'password':
        case 'phoneNumber':
        case 'url':
          type = 'string'
          break
        case 'number':
        case 'currency':
          type = 'number'
          break
        case 'checkbox':
          type = 'boolean'
          break
        case 'datetime':
        case 'day':
        case 'time':
          type = 'Date | string'
          break
        case 'select':
        case 'radio':
          type = 'string'
          break
        case 'file':
          type = 'File | File[]'
          break
        default:
          type = 'any'
      }

      typescript += `  ${component.key}${optional}: ${type}\n`
    })

    typescript += '}\n'
    return typescript
  }

  // Initialize
  loadForms()

  return {
    // State
    currentForm,
    formHistory,
    formVersions,
    // Actions
    setCurrentForm,
    saveToHistory,
    loadFromHistory,
    deleteFromHistory,
    exportForm,
    duplicateForm,
    createVersion,
    clearHistory,
    // Getters
    recentForms,
    formById,
    versionsForForm,
  }
})
