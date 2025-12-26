# AI Form Generator - AI Workflow & Architecture

## Overview

This application uses **Groq API** with **LangChain** to power AI-driven form generation using two specialized Llama 4 models.

---

## AI Models

### Llama 4 Maverick (Text Generation)
- **Model ID:** `meta-llama/llama-4-maverick-17b-128e-instruct`
- **Use Case:** Text-based form generation, custom component creation, CSS generation
- **Parameters:**
  - Temperature: 0.3 (consistent outputs)
  - Max Tokens: 4000
  - Timeout: 30 seconds

### Llama 4 Scout (Vision)
- **Model ID:** `meta-llama/llama-4-scout-17b-16e-instruct`
- **Use Case:** Image analysis, form cloning from screenshots
- **Capability:** Analyzes form layouts, field types, labels, validation rules

**Automatic Model Selection:**
The backend automatically switches between models based on whether an image is included in the request.

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Vue 3 + TypeScript | User interface, form preview |
| **Backend** | NestJS + TypeScript | API server, business logic |
| **AI Framework** | LangChain | Message formatting, AI abstraction |
| **AI Provider** | Groq API | Fast LLM inference |
| **Form Engine** | Form.io | Schema rendering |

---

## Complete Workflow

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │ 1. User inputs description or uploads image
       ▼
┌─────────────────────────┐
│   Vue 3 Frontend        │
│  - ChatInterface.vue    │
│  - FormRenderer.vue     │
│  - useFormGenerator.ts  │
└──────┬──────────────────┘
       │ 2. HTTP POST /chat/generate-form
       ▼
┌─────────────────────────┐
│   NestJS Backend        │
│  - ChatController       │
│  - FormGeneratorService │
└──────┬──────────────────┘
       │ 3. Build prompt
       ▼
┌─────────────────────────┐
│   PromptService         │
│  - Few-shot examples    │
│  - Intent detection     │
│  - System instructions  │
└──────┬──────────────────┘
       │ 4. Format messages
       ▼
┌─────────────────────────┐
│   LlmService            │
│  - Model selection      │
│  - Retry logic          │
│  - Error handling       │
└──────┬──────────────────┘
       │ 5. LangChain conversion
       ▼
┌─────────────────────────┐
│   LangChain             │
│  - ChatGroq integration │
│  - Message formatting   │
└──────┬──────────────────┘
       │ 6. Groq API call
       ▼
┌─────────────────────────┐
│   Groq API              │
│  - Llama 4 Maverick     │
│  - Llama 4 Scout        │
└──────┬──────────────────┘
       │ 7. JSON response
       ▼
┌─────────────────────────┐
│   SchemaValidator       │
│  - Validate structure   │
│  - Sanitize output      │
└──────┬──────────────────┘
       │ 8. Return to frontend
       ▼
┌─────────────────────────┐
│   Vue 3 Frontend        │
│  - Display form preview │
│  - Inject custom CSS    │
└─────────────────────────┘
```

---

## Frontend → Backend Communication

### Frontend Request (useFormGenerator.ts)

```typescript
const generateForm = async (
  message: string,
  conversationHistory: Message[],
  image?: string
) => {
  const response = await fetch(`${apiUrl}/chat/generate-form`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationHistory,
      image  // base64 if present
    })
  })

  return await response.json()
}
```

### Backend Processing (FormGeneratorService)

```typescript
async generateForm(
  userDescription: string,
  conversationHistory?: ConversationMessage[],
  imageData?: string
): Promise<{ schema: FormioSchema; css?: string }> {

  // 1. Build prompt with context
  const messages = this.promptService.buildPrompt(
    userDescription,
    conversationHistory,
    imageData
  )

  // 2. Call AI via LangChain
  const rawResponse = await this.llmService.generateSchema(messages)

  // 3. Parse and clean response
  const cleanedResponse = this.extractJSON(rawResponse)
  const parsed = JSON.parse(cleanedResponse)

  // 4. Validate schema
  const validatedSchema = this.schemaValidatorService.validateSchema(
    parsed.schema
  )

  return {
    schema: validatedSchema,
    css: parsed.css || null
  }
}
```

---

## Prompt Engineering

### System Prompt Structure

```typescript
const SYSTEM_PROMPT = `
You are an expert Form.io form generator.

🚨 CRITICAL RULES:
1. Return ONLY valid JSON - no explanations
2. Use this exact format:
{
  "schema": { "components": [...] },
  "css": "/* optional styles */"
}

FORM.IO COMPONENT TYPES:
- textfield: Basic text input
- email: Email with validation
- phoneNumber: Phone input
- textarea: Multi-line text
- number: Numeric input
- checkbox: Single checkbox
- select: Dropdown menu
- datetime: Date/time picker
- button: Submit/action button

VALIDATION PROPERTIES:
- required: true/false
- minLength, maxLength: number
- pattern: regex string

EXAMPLES:
${FEW_SHOT_EXAMPLES}
`
```

### Few-Shot Learning Examples

**Example 1: Contact Form**
```json
{
  "user": "create contact form",
  "assistant": {
    "schema": {
      "components": [
        {
          "type": "textfield",
          "key": "name",
          "label": "Name",
          "required": true
        },
        {
          "type": "email",
          "key": "email",
          "label": "Email",
          "required": true
        },
        {
          "type": "phoneNumber",
          "key": "phone",
          "label": "Phone"
        },
        {
          "type": "textarea",
          "key": "message",
          "label": "Message",
          "rows": 5
        },
        {
          "type": "button",
          "action": "submit",
          "label": "Submit"
        }
      ]
    }
  }
}
```

**Example 2: Styled Form**
```json
{
  "user": "create login form with blue theme",
  "assistant": {
    "schema": {
      "components": [
        {"type": "email", "key": "email"},
        {"type": "password", "key": "password"},
        {"type": "button", "action": "submit"}
      ]
    },
    "css": ".form-control { border: 2px solid #3b82f6; border-radius: 8px; } .btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); }"
  }
}
```

### Intent Detection

```typescript
// Detect what user wants to do
const detectIntent = (message: string) => {
  const lower = message.toLowerCase()

  // Create new form
  if (['create', 'make', 'build', 'generate'].some(kw => lower.includes(kw))) {
    return 'create'
  }

  // Style existing form
  if (['style', 'color', 'theme', 'blue', 'modern'].some(kw => lower.includes(kw))) {
    return 'style'  // Include CSS in response
  }

  // Modify existing form
  if (['modify', 'update', 'change', 'add', 'remove'].some(kw => lower.includes(kw))) {
    return 'modify'  // Use conversation context
  }

  return 'chat'  // General conversation
}
```

---

## LangChain Integration

### Message Format Conversion

**Input (Custom Format):**
```typescript
{
  role: 'user',
  content: 'create contact form'
}
```

**LangChain Format:**
```typescript
new HumanMessage('create contact form')
```

**Groq API Format:**
```json
{
  "messages": [
    {"role": "user", "content": "create contact form"}
  ],
  "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
  "temperature": 0.3,
  "max_tokens": 4000
}
```

### Vision Model Support

For image-based requests:

```typescript
{
  role: 'user',
  content: [
    { type: 'text', text: 'recreate this form' },
    {
      type: 'image_url',
      image_url: {
        url: 'data:image/png;base64,iVBORw0KGgoAAAANS...'
      }
    }
  ]
}
```

### LlmService Implementation

```typescript
async generateSchema(messages: ConversationMessage[]): Promise<string> {

  // Auto-select model based on image presence
  const hasImage = messages.some(m =>
    Array.isArray(m.content) &&
    m.content.some(c => c.type === 'image_url')
  )

  const model = hasImage
    ? 'meta-llama/llama-4-scout-17b-16e-instruct'    // Vision
    : 'meta-llama/llama-4-maverick-17b-128e-instruct' // Text

  // Initialize LangChain ChatGroq
  const chatModel = new ChatGroq({
    apiKey: this.groqApiKey,
    model,
    temperature: 0.3,
    maxTokens: 4000
  })

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await chatModel.invoke(messages)
      return response.content
    } catch (error) {
      if (!this.isRetryable(error) || attempt === 2) throw error
      await this.sleep(1000 * Math.pow(2, attempt))  // 1s, 2s, 4s
    }
  }
}
```

---

## Error Handling & Resilience

### Retry Logic

```typescript
const MAX_RETRIES = 3
const BASE_DELAY = 1000  // 1 second

for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  try {
    return await callAI()
  } catch (error) {
    // Retryable errors
    if (error.code === 429 ||      // Rate limit
        error.code === 'TIMEOUT' || // Timeout
        error.code === 503) {       // Service unavailable

      const delay = BASE_DELAY * Math.pow(2, attempt)  // Exponential backoff
      await sleep(delay)
      continue
    }

    // Non-retryable: throw immediately
    throw error
  }
}
```

### JSON Parsing Fallbacks

```typescript
const parseAIResponse = (response: string): object => {
  // 1. Try direct parse
  try {
    return JSON.parse(response)
  } catch {}

  // 2. Strip text before { and after }
  const start = response.indexOf('{')
  const end = response.lastIndexOf('}') + 1
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(response.substring(start, end))
    } catch {}
  }

  // 3. Regex extraction
  const match = response.match(/\{[\s\S]*\}/)
  if (match) {
    return JSON.parse(match[0])
  }

  throw new Error('No valid JSON found in AI response')
}
```

---

## Conversation Context

### Frontend Message Tracking

```typescript
// ChatInterface.vue
const messages = ref<Message[]>([
  { role: 'assistant', content: 'Welcome!' }
])

const getConversationHistory = () => {
  return messages.value
    .slice(1)  // Skip welcome message
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))
}
```

### Backend Context Usage

```typescript
// PromptService
const buildPromptWithContext = (message, history) => {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,  // All previous conversation
    { role: 'user', content: message }  // New message
  ]
}
```

**This allows the AI to:**
- Remember previous requests
- Make iterative improvements: "add phone field"
- Maintain design consistency
- Understand context without repeating entire form

---

## Complete Example: Form Generation Flow

### 1. User Input
```
User types: "create contact form with name, email, phone"
```

### 2. Frontend Request
```typescript
POST http://localhost:3000/chat/generate-form
{
  "message": "create contact form with name, email, phone",
  "conversationHistory": []
}
```

### 3. Backend Prompt Building
```typescript
[
  {
    role: 'system',
    content: 'You are a Form.io expert... [system prompt]'
  },
  {
    role: 'user',
    content: 'create contact form with name, email, phone'
  }
]
```

### 4. LangChain → Groq API
```json
{
  "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
  "messages": [...],
  "temperature": 0.3,
  "max_tokens": 4000
}
```

### 5. AI Response
```json
{
  "schema": {
    "components": [
      {
        "type": "textfield",
        "key": "name",
        "label": "Name",
        "required": true
      },
      {
        "type": "email",
        "key": "email",
        "label": "Email",
        "required": true,
        "validate": { "email": true }
      },
      {
        "type": "phoneNumber",
        "key": "phone",
        "label": "Phone Number"
      },
      {
        "type": "button",
        "action": "submit",
        "label": "Submit",
        "theme": "primary"
      }
    ]
  }
}
```

### 6. Validation
```typescript
// SchemaValidator checks:
✓ components array exists
✓ each component has type and key
✓ at least one submit button
✓ valid Form.io component types
```

### 7. Frontend Response
```typescript
{
  response: "I've created a contact form with name, email, and phone fields.",
  schema: { components: [...] },
  css: null
}
```

### 8. Frontend Rendering
```vue
<FormRenderer :schema="schema" />
```

Form.io renders the schema and user sees live preview!

---

## Custom Component Generation Flow

### User Input
```
"create a slider component for selecting values 0-100"
```

### Backend Endpoint
```
POST /chat/generate-custom-component
```

### AI Response
```json
{
  "componentCode": "import React from 'react'...",
  "templateCode": "export const SliderTemplate = () => {...}"
}
```

### Code Unescaping
```typescript
const unescapeCode = (code: string): string => {
  return code
    .replace(/\\n/g, '\n')    // Newlines
    .replace(/\\t/g, '\t')    // Tabs
    .replace(/\\"/g, '"')    // Quotes
    .replace(/\\\\/g, '\\')  // Backslashes
}
```

### Frontend Display
```vue
<CodeViewer
  :componentCode="componentCode"
  :templateCode="templateCode"
/>
```

User can copy or download both `.tsx` files!

---

## Performance Optimization

### Temperature Settings

| Temperature | Use Case | Output |
|-------------|----------|--------|
| 0.0 - 0.3 | Form generation | Consistent, predictable |
| 0.4 - 0.7 | CSS generation | Balanced creativity |
| 0.8 - 1.0 | Creative text | Diverse, creative |

**Our Choice: 0.3**
- Ensures consistent schema structure
- Reduces hallucinations
- Maintains JSON format compliance

### Token Usage

**Input Tokens:**
- System prompt: ~800 tokens
- Few-shot examples: ~600 tokens
- Conversation history: ~200 tokens/message
- User message: ~50-200 tokens

**Total Input:** ~1,650 - 2,500 tokens

**Output Tokens:**
- Simple form: ~300 tokens
- Complex form: ~1,500 tokens
- Custom component: ~2,000 tokens

**Total per Request:** ~2,000 - 4,500 tokens

---

## API Endpoints

### POST /chat/generate-form

**Request:**
```json
{
  "message": "create contact form",
  "conversationHistory": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ],
  "image": "data:image/png;base64,..."  // optional
}
```

**Response:**
```json
{
  "response": "I've created a contact form",
  "schema": {
    "components": [...]
  },
  "css": "/* optional */"
}
```

### POST /chat/generate-custom-component

**Request:**
```json
{
  "message": "create slider component",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "Component generated successfully",
  "componentCode": "// component.tsx",
  "templateCode": "// template.tsx"
}
```

---

**Key Takeaway:**

The application seamlessly integrates frontend Vue 3 components with backend NestJS services, leveraging LangChain for message formatting and two specialized Llama 4 models (Maverick for text, Scout for vision) through Groq API, with comprehensive error handling, retry logic, and prompt engineering to ensure reliable Form.io schema generation.

**Version:** 1.0.0
**Last Updated:** 2025-12-24
