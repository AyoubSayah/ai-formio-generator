import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FormSchema } from './forms'

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  schema: FormSchema
}

// Pre-built templates
const defaultTemplates: FormTemplate[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    category: 'General',
    schema: {
      display: 'form',
      title: 'Contact Form',
      components: [
        {
          type: 'textfield',
          key: 'name',
          label: 'Name',
          input: true,
          placeholder: 'Enter your full name',
          validate: { required: true },
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email',
          input: true,
          placeholder: 'your.email@example.com',
          validate: { required: true },
        },
        {
          type: 'textarea',
          key: 'message',
          label: 'Message',
          input: true,
          rows: 5,
          placeholder: 'Your message',
          validate: { required: true },
        },
        {
          type: 'button',
          key: 'submit',
          label: 'Submit',
          input: true,
          action: 'submit',
          theme: 'primary',
        },
      ],
    },
  },
  {
    id: 'registration-form',
    name: 'Registration Form',
    description: 'User registration with password confirmation',
    category: 'Authentication',
    schema: {
      display: 'form',
      title: 'Registration Form',
      components: [
        {
          type: 'textfield',
          key: 'username',
          label: 'Username',
          input: true,
          validate: { required: true, minLength: 3 },
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email',
          input: true,
          validate: { required: true },
        },
        {
          type: 'password',
          key: 'password',
          label: 'Password',
          input: true,
          validate: { required: true, minLength: 8 },
        },
        {
          type: 'password',
          key: 'confirmPassword',
          label: 'Confirm Password',
          input: true,
          validate: { required: true },
        },
        {
          type: 'checkbox',
          key: 'agreeToTerms',
          label: 'I agree to the terms and conditions',
          input: true,
          validate: { required: true },
        },
        {
          type: 'button',
          key: 'submit',
          label: 'Register',
          input: true,
          action: 'submit',
          theme: 'primary',
        },
      ],
    },
  },
  {
    id: 'survey-form',
    name: 'Survey Form',
    description: 'Customer feedback and satisfaction survey',
    category: 'Feedback',
    schema: {
      display: 'form',
      title: 'Customer Survey',
      components: [
        {
          type: 'radio',
          key: 'satisfaction',
          label: 'How satisfied are you with our service?',
          input: true,
          values: [
            { label: 'Very Satisfied', value: '5' },
            { label: 'Satisfied', value: '4' },
            { label: 'Neutral', value: '3' },
            { label: 'Dissatisfied', value: '2' },
            { label: 'Very Dissatisfied', value: '1' },
          ],
          validate: { required: true },
        },
        {
          type: 'textarea',
          key: 'comments',
          label: 'Additional Comments',
          input: true,
          rows: 4,
        },
        {
          type: 'checkbox',
          key: 'wouldRecommend',
          label: 'Would you recommend us to others?',
          input: true,
        },
        {
          type: 'button',
          key: 'submit',
          label: 'Submit Survey',
          input: true,
          action: 'submit',
          theme: 'primary',
        },
      ],
    },
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Complete job application form with resume upload',
    category: 'HR',
    schema: {
      display: 'form',
      title: 'Job Application',
      components: [
        {
          type: 'textfield',
          key: 'fullName',
          label: 'Full Name',
          input: true,
          validate: { required: true },
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email',
          input: true,
          validate: { required: true },
        },
        {
          type: 'phoneNumber',
          key: 'phone',
          label: 'Phone Number',
          input: true,
          validate: { required: true },
        },
        {
          type: 'select',
          key: 'position',
          label: 'Position Applied For',
          input: true,
          data: {
            values: [
              { label: 'Software Engineer', value: 'engineer' },
              { label: 'Product Manager', value: 'pm' },
              { label: 'Designer', value: 'designer' },
              { label: 'Marketing', value: 'marketing' },
            ],
          },
          validate: { required: true },
        },
        {
          type: 'textarea',
          key: 'coverLetter',
          label: 'Cover Letter',
          input: true,
          rows: 6,
          validate: { required: true },
        },
        {
          type: 'button',
          key: 'submit',
          label: 'Submit Application',
          input: true,
          action: 'submit',
          theme: 'primary',
        },
      ],
    },
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Register for events with dietary preferences',
    category: 'Events',
    schema: {
      display: 'form',
      title: 'Event Registration',
      components: [
        {
          type: 'textfield',
          key: 'name',
          label: 'Full Name',
          input: true,
          validate: { required: true },
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email',
          input: true,
          validate: { required: true },
        },
        {
          type: 'select',
          key: 'dietaryPreference',
          label: 'Dietary Preference',
          input: true,
          data: {
            values: [
              { label: 'No Restrictions', value: 'none' },
              { label: 'Vegetarian', value: 'vegetarian' },
              { label: 'Vegan', value: 'vegan' },
              { label: 'Gluten-Free', value: 'gluten-free' },
              { label: 'Other', value: 'other' },
            ],
          },
        },
        {
          type: 'number',
          key: 'attendees',
          label: 'Number of Attendees',
          input: true,
          validate: { required: true, min: 1 },
        },
        {
          type: 'button',
          key: 'submit',
          label: 'Register',
          input: true,
          action: 'submit',
          theme: 'primary',
        },
      ],
    },
  },
  {
    id: 'feedback-form',
    name: 'Feedback Form',
    description: 'General feedback collection form',
    category: 'Feedback',
    schema: {
      display: 'form',
      title: 'Feedback Form',
      components: [
        {
          type: 'textfield',
          key: 'name',
          label: 'Name (Optional)',
          input: true,
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email (Optional)',
          input: true,
        },
        {
          type: 'select',
          key: 'category',
          label: 'Feedback Category',
          input: true,
          data: {
            values: [
              { label: 'Bug Report', value: 'bug' },
              { label: 'Feature Request', value: 'feature' },
              { label: 'General Feedback', value: 'general' },
              { label: 'Complaint', value: 'complaint' },
            ],
          },
          validate: { required: true },
        },
        {
          type: 'textarea',
          key: 'feedback',
          label: 'Your Feedback',
          input: true,
          rows: 6,
          validate: { required: true },
        },
        {
          type: 'button',
          key: 'submit',
          label: 'Submit Feedback',
          input: true,
          action: 'submit',
          theme: 'primary',
        },
      ],
    },
  },
]

export const useTemplatesStore = defineStore('templates', () => {
  // State
  const templates = ref<FormTemplate[]>([...defaultTemplates])

  // Load custom templates from localStorage
  const loadTemplates = () => {
    const saved = localStorage.getItem('custom_templates')
    if (saved) {
      try {
        const customTemplates = JSON.parse(saved)
        templates.value = [...defaultTemplates, ...customTemplates]
      } catch (error) {
        console.error('Failed to load custom templates:', error)
      }
    }
  }

  // Save custom templates to localStorage
  const saveCustomTemplates = () => {
    const customTemplates = templates.value.filter(
      (t) => !defaultTemplates.find((dt) => dt.id === t.id)
    )
    localStorage.setItem('custom_templates', JSON.stringify(customTemplates))
  }

  // Actions
  const applyTemplate = (id: string) => {
    return templates.value.find((t) => t.id === id)?.schema || null
  }

  const saveAsTemplate = (schema: FormSchema, name: string, category: string = 'Custom') => {
    const newTemplate: FormTemplate = {
      id: crypto.randomUUID(),
      name,
      description: `Custom template: ${name}`,
      category,
      schema,
    }
    templates.value.push(newTemplate)
    saveCustomTemplates()
  }

  const deleteTemplate = (id: string) => {
    // Prevent deleting default templates
    if (defaultTemplates.find((t) => t.id === id)) {
      console.warn('Cannot delete default templates')
      return
    }
    templates.value = templates.value.filter((t) => t.id !== id)
    saveCustomTemplates()
  }

  const getTemplatesByCategory = (category: string) => {
    return templates.value.filter((t) => t.category === category)
  }

  const categories = () => {
    const cats = new Set(templates.value.map((t) => t.category))
    return Array.from(cats)
  }

  // Initialize
  loadTemplates()

  return {
    // State
    templates,
    // Actions
    applyTemplate,
    saveAsTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    categories,
  }
})
