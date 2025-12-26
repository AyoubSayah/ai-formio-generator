import { Injectable } from '@nestjs/common';
import {
  ConversationMessage,
  MessageContent,
  TextContent,
  ImageContent,
} from '../forms/form-schema.interface';

@Injectable()
export class PromptService {
  private readonly systemPrompt = `You are an expert Form.io schema generator. You MUST create complete, functional forms from descriptions or images.

🚨 CRITICAL RULES - READ CAREFULLY:
1. You MUST return ONLY valid JSON - NO explanations, NO markdown, NO extra text!
2. Your response must start with { and end with }
3. NEVER return empty forms or forms with no components!
4. ALWAYS include EVERY field mentioned in the user's request - DO NOT skip any!
5. ALWAYS return valid JSON in this EXACT structure (copy this format exactly):

{
  "schema": {
    "display": "form",
    "title": "Descriptive Form Title",
    "components": [ /* AT LEAST 2+ components - INCLUDE ALL REQUESTED FIELDS */ ]
  },
  "css": "/* CSS styles here */"
}

6. The "css" field is REQUIRED when user mentions ANY styling words (colors, gradient, shadow, rounded, etc.)
7. If user mentions styling, you MUST generate actual CSS code, not null!
8. Read the user's request CAREFULLY and include EVERY field they mention!

⚠️ DO NOT write explanations like "To improve..." or "Here's the form" - ONLY return the JSON object!

💡 UNDERSTANDING USER INTENT:
- "create", "make", "build", "generate" → Create NEW form from scratch
- "improve", "modify", "update", "change", "style" → If conversation history shows existing form, MODIFY it; otherwise create new
- "add X field" → Keep existing fields and ADD the new one
- "remove X field" → Keep all fields EXCEPT the one mentioned
- "change colors to blue" → Keep same fields, update CSS only
- "make it modern" → Keep same fields, generate modern CSS styling
- Single word requests like "create login form" → Interpret intelligently and create appropriate form

📋 COMPONENT TYPES YOU MUST USE:
- textfield → Name, username, generic text
- email → Email addresses (has built-in validation)
- password → Passwords
- phoneNumber → Phone numbers
- textarea → Long text, messages, comments
- number → Numbers, age, quantity
- checkbox → Single yes/no, agree to terms
- radio → Choose one option (inline display)
- select → Dropdown for one choice
- selectboxes → Multiple checkboxes for multiple choices
- datetime → Dates, birthdays
- button → Submit button (ALWAYS last!)
- file → File uploads

🎯 FIELD REQUIREMENTS:
EVERY component MUST have:
- type: string (from list above)
- key: string (camelCase, unique, e.g., "firstName", "emailAddress")
- label: string (user-friendly label)
- input: boolean (always true except button)

Optional but recommended:
- placeholder: string (helpful hint)
- validate: { required: boolean, minLength: number, etc. }

📸 WHEN IMAGE PROVIDED:
1. CAREFULLY analyze the image
2. Identify EVERY field, label, and button
3. Match the visual style with CSS
4. Include ALL form elements you see
5. CSS should include colors, fonts, spacing, borders

🎨 CSS GENERATION - VERY IMPORTANT:
You MUST generate CSS when user mentions ANY of these:
- Colors (blue, green, purple, red, etc.)
- Gradients (gradient background)
- Shadows (shadow, box-shadow)
- Rounded corners (rounded)
- Sizing (large, small, big)
- ANY visual styling words

CSS MUST target Form.io classes like:
- .formio-component-submit button { } → Submit buttons
- .formio-component-email input { } → Email inputs
- .formio-component-password input { } → Password inputs
- .form-control { } → All input fields
- body or wrapper classes for backgrounds

Example CSS (USE THIS AS TEMPLATE):
"css": ".form-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; } .form-control { background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; } .formio-component-submit button { background: #42b983; color: white; border-radius: 25px; padding: 12px 40px; font-size: 16px; }"

EXAMPLES OF COMPLETE FORMS:

Example 1 - Login Form WITH STYLING:
{
  "schema": {
    "display": "form",
    "title": "Login",
    "components": [
      {
        "type": "email",
        "key": "email",
        "label": "Email",
        "input": true,
        "placeholder": "Enter your email",
        "validate": { "required": true }
      },
      {
        "type": "password",
        "key": "password",
        "label": "Password",
        "input": true,
        "placeholder": "Enter password",
        "validate": { "required": true, "minLength": 8 }
      },
      {
        "type": "button",
        "key": "submit",
        "label": "Login",
        "input": true,
        "action": "submit",
        "theme": "primary"
      }
    ]
  },
  "css": ".form-control { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 12px; } .formio-component-submit button { background: #007bff; color: white; border-radius: 8px; padding: 12px 30px; font-weight: 600; }"
}

Example 2 - Survey with CSS:
{
  "schema": {
    "display": "form",
    "title": "Customer Feedback",
    "components": [
      {
        "type": "textfield",
        "key": "name",
        "label": "Your Name",
        "input": true,
        "validate": { "required": true }
      },
      {
        "type": "radio",
        "key": "satisfaction",
        "label": "How satisfied are you?",
        "input": true,
        "values": [
          { "label": "Very Satisfied", "value": "5" },
          { "label": "Satisfied", "value": "4" },
          { "label": "Neutral", "value": "3" },
          { "label": "Unsatisfied", "value": "2" },
          { "label": "Very Unsatisfied", "value": "1" }
        ],
        "validate": { "required": true }
      },
      {
        "type": "textarea",
        "key": "comments",
        "label": "Additional Comments",
        "input": true,
        "rows": 4
      },
      {
        "type": "button",
        "key": "submit",
        "label": "Submit Feedback",
        "input": true,
        "action": "submit",
        "theme": "primary"
      }
    ]
  },
  "css": ".formio-component-submit button { background-color: #2196F3; color: white; font-size: 16px; padding: 12px 30px; border-radius: 8px; border: none; cursor: pointer; } .formio-component-submit button:hover { background-color: #1976D2; }"
}

⚠️ VALIDATION:
- required: true → Field is mandatory
- minLength: number → Minimum characters
- maxLength: number → Maximum characters
- pattern: "regex" → Custom validation

🔑 KEY NAMING:
- Use camelCase
- Be descriptive: "firstName" not "fn"
- No spaces or special characters
- Must be unique per form

❌ COMMON MISTAKES TO AVOID:
- Empty components array
- Missing "input: true" on fields
- Missing submit button
- Invalid component types
- Duplicate keys
- Not analyzing images carefully
- SKIPPING FIELDS that the user requested
- Returning "css": null when user mentions styling
- Not generating CSS for color/gradient/shadow requests

📝 FINAL REMINDER BEFORE YOU RESPOND:
1. Did you include EVERY field the user mentioned? (Check again!)
2. Did the user mention ANY styling words? If YES, generate CSS!
3. Is your response valid JSON with both "schema" and "css" fields?
4. Does your form have at least 2 components plus a submit button?
5. Are you returning ONLY the JSON object with NO explanations?

⚠️ CRITICAL - DO NOT WRITE:
❌ "To improve this form..."
❌ "Here's the form:"
❌ "I suggest..."
❌ Any text before { or after }

✅ CORRECT - Return ONLY this:
{ "schema": { ... }, "css": "..." }

Remember: Quality over speed. Return ONLY valid JSON!`;

  private readonly fewShotExamples: Array<{
    user: string;
    assistant: string;
  }> = [
    {
      user: 'Create a contact form with name, email, phone, and message. All fields are required.',
      assistant: JSON.stringify(
        {
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
                validate: {
                  required: true,
                },
              },
              {
                type: 'email',
                key: 'email',
                label: 'Email Address',
                input: true,
                placeholder: 'Enter your email',
                validate: {
                  required: true,
                },
              },
              {
                type: 'phoneNumber',
                key: 'phone',
                label: 'Phone Number',
                input: true,
                placeholder: 'Enter your phone number',
                validate: {
                  required: true,
                },
              },
              {
                type: 'textarea',
                key: 'message',
                label: 'Message',
                input: true,
                rows: 5,
                placeholder: 'Enter your message',
                validate: {
                  required: true,
                },
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
          css: null,
        },
        null,
        2,
      ),
    },
    {
      user: 'I need a registration form with username, email, password, confirm password, date of birth, and a checkbox to agree to terms',
      assistant: JSON.stringify(
        {
          schema: {
            display: 'form',
            title: 'Registration Form',
            components: [
              {
                type: 'textfield',
                key: 'username',
                label: 'Username',
                input: true,
                placeholder: 'Choose a username',
                validate: {
                  required: true,
                  minLength: 3,
                  maxLength: 20,
                },
              },
              {
                type: 'email',
                key: 'email',
                label: 'Email Address',
                input: true,
                placeholder: 'Enter your email',
                validate: {
                  required: true,
                },
              },
              {
                type: 'password',
                key: 'password',
                label: 'Password',
                input: true,
                placeholder: 'Create a password',
                validate: {
                  required: true,
                  minLength: 8,
                },
              },
              {
                type: 'password',
                key: 'confirmPassword',
                label: 'Confirm Password',
                input: true,
                placeholder: 'Re-enter your password',
                validate: {
                  required: true,
                },
              },
              {
                type: 'datetime',
                key: 'dateOfBirth',
                label: 'Date of Birth',
                input: true,
                format: 'yyyy-MM-dd',
                enableDate: true,
                enableTime: false,
                validate: {
                  required: true,
                },
              },
              {
                type: 'checkbox',
                key: 'agreeToTerms',
                label: 'I agree to the terms and conditions',
                input: true,
                validate: {
                  required: true,
                },
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
          css: null,
        },
        null,
        2,
      ),
    },
    {
      user: 'Create a survey form with a dropdown to select favorite color (Red, Blue, Green, Yellow) and a rating from 1 to 5',
      assistant: JSON.stringify(
        {
          schema: {
            display: 'form',
            title: 'Survey Form',
            components: [
              {
                type: 'select',
                key: 'favoriteColor',
                label: 'What is your favorite color?',
                input: true,
                placeholder: 'Select a color',
                data: {
                  values: [
                    { label: 'Red', value: 'red' },
                    { label: 'Blue', value: 'blue' },
                    { label: 'Green', value: 'green' },
                    { label: 'Yellow', value: 'yellow' },
                  ],
                },
                validate: {
                  required: true,
                },
              },
              {
                type: 'radio',
                key: 'rating',
                label: 'Rate your experience (1-5)',
                input: true,
                values: [
                  { label: '1 - Poor', value: '1' },
                  { label: '2 - Fair', value: '2' },
                  { label: '3 - Good', value: '3' },
                  { label: '4 - Very Good', value: '4' },
                  { label: '5 - Excellent', value: '5' },
                ],
                validate: {
                  required: true,
                },
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
          css: null,
        },
        null,
        2,
      ),
    },
  ];

  /**
   * Build the complete prompt for the LLM including system prompt,
   * few-shot examples, and the user's request
   */
  buildPrompt(
    userMessage: string,
    conversationHistory?: ConversationMessage[],
    imageData?: string,
  ): ConversationMessage[] {
    const messages: ConversationMessage[] = [
      {
        role: 'system',
        content:
          this.systemPrompt +
          (imageData
            ? '\n\nWhen an image is provided, carefully analyze the form layout, field types, labels, and structure shown in the image to generate an accurate Form.io schema.'
            : ''),
      },
    ];

    // Add few-shot examples (only if no image, to save tokens)
    if (!imageData) {
      for (const example of this.fewShotExamples) {
        messages.push({
          role: 'user',
          content: example.user,
        });
        messages.push({
          role: 'assistant',
          content: example.assistant,
        });
      }
    }

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // Add current user message with optional image
    const userContent: MessageContent = imageData
      ? [
          {
            type: 'text',
            text:
              userMessage ||
              'Generate a Form.io schema based on the form shown in this image.',
          } as TextContent,
          {
            type: 'image_url',
            image_url: {
              url: imageData,
            },
          } as ImageContent,
        ]
      : userMessage;

    messages.push({
      role: 'user',
      content: userContent,
    });

    return messages;
  }

  /**
   * Extract JSON from LLM response that might include markdown code blocks
   */
  extractJSON(response: string): string {
    // Remove markdown code blocks if present
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = response.match(codeBlockRegex);

    if (match) {
      return match[1].trim();
    }

    // Return as-is if no code blocks found
    return response.trim();
  }

  buildCustomComponentPrompt(
    userMessage: string,
    conversationHistory?: ConversationMessage[],
  ): ConversationMessage[] {
    const systemPrompt = `You are an expert React and Form.io developer. Generate custom Form.io React components.

🚨 CRITICAL RULES - READ CAREFULLY:
1. You MUST return ONLY valid JSON - NO explanations, NO markdown, NO extra text
2. Start your response with { and end with }
3. Your ENTIRE response must be this EXACT JSON structure:
{
  "componentCode": "// component.tsx code here",
  "templateCode": "// template.tsx code here"
}

2. Generate TWO files:
   - componentCode: The Form.io ReactComponent class (component.tsx)
   - templateCode: The React UI component (template.tsx)

3. JSON FORMATTING RULES - VERY IMPORTANT:
   - Use \\n for newlines (NOT actual newlines in the JSON string)
   - Use \\" for double quotes inside the code strings
   - Use \\\\ for backslashes
   - Do NOT use backticks - use single quotes or double quotes
   - All code must be on ONE line with \\n separators
   - Example: "const x = \\"hello\\";\\nconst y = 5;"

📋 COMPONENT.TSX STRUCTURE:
\`\`\`typescript
import { ReactComponent } from '@formio/react'
import FieldComponent from 'formiojs/components/_classes/field/Field'
import baseEditForm from 'formiojs/components/select/Select.form'
import Template from './template'
import { createRoot, Root } from 'react-dom/client'

export default class CustomComponent extends ReactComponent {
  [x: string]: any
  elem: Root

  static schema() {
    return FieldComponent.schema({
      type: 'CustomComponent',
      label: 'Custom Component Label',
      key: 'customComponent',
    })
  }

  static get builderInfo() {
    return {
      title: 'Custom Component',
      icon: 'circle',
      group: 'custom',
      documentation: '',
      weight: -20,
      schema: CustomComponent.schema(),
    }
  }

  attachReact(element: any, ref: any) {
    this.elem = createRoot(element)
    this.renderReact(element)
  }

  renderReact(element: any) {
    return this.elem.render(
      <Template
        value={this.dataValue}
        onChange={(value) => this.updateValue(value)}
        {...this.component}
      />
    )
  }

  detachReact(element: any) {
    if (this.elem?.unmount) {
      this.elem.unmount()
    }
  }

  static editForm = (...extend: any) => {
    return baseEditForm([
      {
        key: 'display',
        components: [
          {
            type: 'textfield',
            key: 'label',
            label: 'Label',
            weight: 0,
          },
          // Add custom configuration fields here
        ],
      },
      ...extend,
    ])
  }
}
\`\`\`

📋 TEMPLATE.TSX STRUCTURE:
\`\`\`typescript
import React, { FC } from 'react'

interface CustomComponentProps {
  value?: any
  onChange?: (value: any) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

const Template: FC<CustomComponentProps> = ({
  value,
  onChange,
  label,
  placeholder,
  disabled,
  required
}) => {
  return (
    <div className="custom-component">
      {label && <label>{label}</label>}
      {/* Your custom UI here */}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  )
}

export default Template
\`\`\`

🎯 KEY REQUIREMENTS:
1. Component name should be PascalCase and match user's description
2. The type in schema() should match the class name
3. Use createRoot from react-dom/client for React 18+
4. Template should be a functional component with TypeScript
5. Always include onChange prop for value updates
6. Include common props: label, placeholder, disabled, required
7. Use proper TypeScript interfaces
8. Format code properly with 2-space indentation

💡 EXAMPLE OUTPUT FORMAT:

User: "Create a rating component"
Response (you must return JSON like this):
{
  "componentCode": "import { ReactComponent } from '@formio/react'\\nimport FieldComponent from 'formiojs/components/_classes/field/Field'\\nimport baseEditForm from 'formiojs/components/select/Select.form'\\nimport Template from './template'\\nimport { createRoot, Root } from 'react-dom/client'\\n\\nexport default class RatingComponent extends ReactComponent {\\n  [x: string]: any\\n  elem: Root\\n  \\n  static schema() {\\n    return FieldComponent.schema({\\n      type: 'RatingComponent',\\n      label: 'Rating',\\n      key: 'rating',\\n    })\\n  }\\n  \\n  static get builderInfo() {\\n    return {\\n      title: 'Rating Component',\\n      icon: 'star',\\n      group: 'custom',\\n      documentation: '',\\n      weight: -20,\\n      schema: RatingComponent.schema(),\\n    }\\n  }\\n  \\n  attachReact(element: any, ref: any) {\\n    this.elem = createRoot(element)\\n    this.renderReact(element)\\n  }\\n  \\n  renderReact(element: any) {\\n    return this.elem.render(\\n      <Template\\n        value={this.dataValue || 0}\\n        onChange={(value) => this.updateValue(value)}\\n        max={this.component.max || 5}\\n        label={this.component.label}\\n      />\\n    )\\n  }\\n  \\n  detachReact(element: any) {\\n    if (this.elem?.unmount) {\\n      this.elem.unmount()\\n    }\\n  }\\n  \\n  static editForm = (...extend: any) => {\\n    return baseEditForm([\\n      {\\n        key: 'display',\\n        components: [\\n          {\\n            type: 'number',\\n            key: 'max',\\n            label: 'Maximum Rating',\\n            defaultValue: 5,\\n          },\\n        ],\\n      },\\n      ...extend,\\n    ])\\n  }\\n}",
  "templateCode": "import React, { FC } from 'react'\\n\\ninterface RatingProps {\\n  value: number\\n  onChange: (value: number) => void\\n  max?: number\\n  label?: string\\n}\\n\\nconst Template: FC<RatingProps> = ({\\n  value,\\n  onChange,\\n  max = 5,\\n  label\\n}) => {\\n  const stars = Array.from({ length: max }, (_, i) => i + 1)\\n  \\n  return (\\n    <div className='rating-component'>\\n      {label && <label>{label}</label>}\\n      <div className='stars'>\\n        {stars.map((star) => (\\n          <span\\n            key={star}\\n            onClick={() => onChange(star)}\\n            style={{\\n              cursor: 'pointer',\\n              color: star <= value ? '#FFD700' : '#DDD',\\n              fontSize: '24px'\\n            }}\\n          >\\n            ★\\n          </span>\\n        ))}\\n      </div>\\n    </div>\\n  )\\n}\\n\\nexport default Template"
}

⚠️ FINAL REMINDERS - EXTREMELY IMPORTANT:
1. Return ONLY the JSON object - NO other text before or after
2. Do NOT write explanations like "Here's the code" or "To improve..."
3. Do NOT use markdown code blocks like \`\`\`json
4. Your response must start with { and end with }
5. All code must be on ONE line with \\n for newlines
6. Escape special characters: \\" for quotes, \\\\ for backslashes
7. NO backticks in the JSON strings - use single quotes instead
8. Your response MUST be parseable by JSON.parse()

WRONG: "Here is the component: { ... }"
WRONG: \`\`\`json\\n{ ... }\\n\`\`\`
WRONG: To improve this component...
RIGHT: { "componentCode": "...", "templateCode": "..." }`;

    const messages: ConversationMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Extract code files from custom component generation response
   */
  extractCustomComponent(response: string): {
    componentCode: string;
    templateCode: string;
  } {
    try {
      // Remove any text before the first { and after the last }
      let cleanedResponse = response.trim();
      const firstBrace = cleanedResponse.indexOf('{');
      const lastBrace = cleanedResponse.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
      }

      const jsonStr = this.extractJSON(cleanedResponse);

      // Try to parse the JSON
      const parsed = JSON.parse(jsonStr);

      // Unescape the newlines in the code strings
      return {
        componentCode: this.unescapeCode(parsed.componentCode || ''),
        templateCode: this.unescapeCode(parsed.templateCode || ''),
      };
    } catch (error) {
      // If JSON parsing fails, try to extract code blocks manually
      const componentMatch = response.match(
        /"componentCode"\s*:\s*"([^]*?)"\s*,?\s*"templateCode"/,
      );
      const templateMatch = response.match(
        /"templateCode"\s*:\s*"([^]*?)"\s*}/,
      );

      if (componentMatch && templateMatch) {
        return {
          componentCode: this.unescapeCode(componentMatch[1]),
          templateCode: this.unescapeCode(templateMatch[1]),
        };
      }

      throw new Error(
        `Failed to parse custom component response: ${error.message}`,
      );
    }
  }

  /**
   * Unescape code strings (convert \\n to actual newlines, etc.)
   */
  private unescapeCode(code: string): string {
    return code
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }
}
