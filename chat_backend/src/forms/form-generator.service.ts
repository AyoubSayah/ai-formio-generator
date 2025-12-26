import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../ai/llm.service';
import { PromptService } from '../ai/prompt.service';
import { SchemaValidatorService } from '../ai/schema-validator.service';
import {
  FormioSchema,
  FormioComponent,
  ConversationMessage,
} from './form-schema.interface';

@Injectable()
export class FormGeneratorService {
  private readonly logger = new Logger(FormGeneratorService.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly promptService: PromptService,
    private readonly schemaValidatorService: SchemaValidatorService,
  ) {}

  /**
   * Generate a form schema from a user description using AI
   * Falls back to keyword matching if AI fails
   */
  async generateForm(
    userDescription: string,
    conversationHistory?: ConversationMessage[],
    imageData?: string,
  ): Promise<{ schema: FormioSchema; css?: string }> {
    // Try AI generation first if configured
    if (this.llmService.isConfigured()) {
      try {
        this.logger.log(
          'Attempting AI-powered form generation' +
            (imageData ? ' with image' : ''),
        );
        return await this.generateWithAI(
          userDescription,
          conversationHistory,
          imageData,
        );
      } catch (error) {
        this.logger.error(`AI generation failed: ${error.message}`);
        this.logger.warn('Falling back to keyword matching');
      }
    } else {
      this.logger.warn(
        'AI not configured, using keyword matching. Set GROQ_API_KEY in .env to enable AI generation.',
      );
    }

    // Fallback to keyword matching
    return { schema: this.generateWithKeywords(userDescription) };
  }

  /**
   * Generate form using AI (LangChain + Groq)
   */
  private async generateWithAI(
    userDescription: string,
    conversationHistory?: ConversationMessage[],
    imageData?: string,
  ): Promise<{ schema: FormioSchema; css?: string }> {
    // Build prompt with few-shot examples
    const messages = this.promptService.buildPrompt(
      userDescription,
      conversationHistory,
      imageData,
    );

    // Call LLM
    const rawResponse = await this.llmService.generateSchema(messages);
    this.logger.debug(`AI Raw Response: ${rawResponse.substring(0, 500)}...`);

    // Log if response doesn't start with { (likely an error)
    const trimmed = rawResponse.trim();
    if (!trimmed.startsWith('{')) {
      this.logger.warn(
        `Response doesn't start with JSON! First 200 chars: ${trimmed.substring(0, 200)}`,
      );
    }

    // Remove any text before the first { and after the last }
    let cleanedResponse = trimmed;
    const firstBrace = cleanedResponse.indexOf('{');
    const lastBrace = cleanedResponse.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    }

    // Extract JSON from response (handles markdown code blocks)
    cleanedResponse = this.promptService.extractJSON(cleanedResponse);
    this.logger.debug(`Cleaned JSON: ${cleanedResponse.substring(0, 500)}...`);

    // Parse response that includes both schema and css
    const parsed = JSON.parse(cleanedResponse);
    this.logger.debug(
      `Parsed schema components count: ${parsed.schema?.components?.length || 0}`,
    );

    // Validate and sanitize the schema
    const validatedSchema = this.schemaValidatorService.validateSchema(
      JSON.stringify(parsed.schema || parsed),
    );

    return {
      schema: validatedSchema,
      css: parsed.css || null,
    };
  }

  /**
   * Generate form using keyword matching (fallback)
   */
  private generateWithKeywords(userDescription: string): FormioSchema {
    this.logger.log('Generating form with keyword matching');

    const components = this.parseDescriptionToComponents(userDescription);

    return {
      display: 'form',
      components,
      title: this.extractTitle(userDescription),
    };
  }

  private parseDescriptionToComponents(description: string): FormioComponent[] {
    const components: FormioComponent[] = [];
    const lowerDesc = description.toLowerCase();

    // Detect name field
    if (lowerDesc.includes('name')) {
      components.push({
        type: 'textfield',
        key: 'name',
        label: 'Name',
        input: true,
        validate: {
          required:
            lowerDesc.includes('required') || lowerDesc.includes('must'),
        },
      });
    }

    // Detect email field
    if (lowerDesc.includes('email')) {
      components.push({
        type: 'email',
        key: 'email',
        label: 'Email',
        input: true,
        validate: {
          required:
            lowerDesc.includes('required') || lowerDesc.includes('must'),
        },
      });
    }

    // Detect phone field
    if (lowerDesc.includes('phone')) {
      components.push({
        type: 'phoneNumber',
        key: 'phone',
        label: 'Phone Number',
        input: true,
        validate: {
          required:
            lowerDesc.includes('required') || lowerDesc.includes('must'),
        },
      });
    }

    // Detect address field
    if (lowerDesc.includes('address')) {
      components.push({
        type: 'textarea',
        key: 'address',
        label: 'Address',
        input: true,
        rows: 3,
        validate: {
          required:
            lowerDesc.includes('required') || lowerDesc.includes('must'),
        },
      });
    }

    // Detect date field
    if (lowerDesc.includes('date') || lowerDesc.includes('birth')) {
      components.push({
        type: 'datetime',
        key: 'date',
        label: 'Date',
        input: true,
        format: 'yyyy-MM-dd',
        enableDate: true,
        enableTime: false,
      });
    }

    // Detect message/comments field
    if (lowerDesc.includes('message') || lowerDesc.includes('comment')) {
      components.push({
        type: 'textarea',
        key: 'message',
        label: 'Message',
        input: true,
        rows: 5,
      });
    }

    // Detect checkbox/agreement
    if (
      lowerDesc.includes('agree') ||
      lowerDesc.includes('terms') ||
      lowerDesc.includes('checkbox')
    ) {
      components.push({
        type: 'checkbox',
        key: 'agreement',
        label: 'I agree to the terms and conditions',
        input: true,
        validate: {
          required: true,
        },
      });
    }

    // Detect select/dropdown
    if (
      lowerDesc.includes('select') ||
      lowerDesc.includes('choose') ||
      lowerDesc.includes('dropdown')
    ) {
      const options = this.extractSelectOptions(description);
      components.push({
        type: 'select',
        key: 'selection',
        label: 'Select an option',
        input: true,
        data: {
          values: options,
        },
      });
    }

    // Add submit button
    components.push({
      type: 'button',
      key: 'submit',
      label: 'Submit',
      input: true,
      action: 'submit',
      theme: 'primary',
    });

    return components;
  }

  private extractTitle(description: string): string {
    if (description.includes('contact')) return 'Contact Form';
    if (
      description.includes('registration') ||
      description.includes('register')
    )
      return 'Registration Form';
    if (description.includes('feedback')) return 'Feedback Form';
    if (description.includes('survey')) return 'Survey Form';
    return 'Form';
  }

  private extractSelectOptions(description: string): any[] {
    // Simple heuristic to extract options
    const optionMatch = description.match(/\((.*?)\)/);
    if (optionMatch) {
      const optionsStr = optionMatch[1];
      const options = optionsStr.split(',').map((opt) => opt.trim());
      return options.map((label) => ({
        label,
        value: label.toLowerCase().replace(/\s+/g, '_'),
      }));
    }

    return [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ];
  }

  /**
   * Generate custom Form.io React component code
   */
  async generateCustomComponent(
    userDescription: string,
    conversationHistory?: ConversationMessage[],
  ): Promise<{ componentCode: string; templateCode: string }> {
    if (!this.llmService.isConfigured()) {
      throw new Error(
        'AI not configured. Set GROQ_API_KEY in .env to enable custom component generation.',
      );
    }

    try {
      this.logger.log('Generating custom Form.io component');

      // Build prompt for custom component generation
      const messages = this.promptService.buildCustomComponentPrompt(
        userDescription,
        conversationHistory,
      );

      // Call LLM
      const rawResponse = await this.llmService.generateSchema(messages);
      this.logger.debug(`AI Raw Response: ${rawResponse.substring(0, 500)}...`);

      // Log if response doesn't start with { (likely an error)
      const trimmed = rawResponse.trim();
      if (!trimmed.startsWith('{')) {
        this.logger.warn(
          `Response doesn't start with JSON! First 200 chars: ${trimmed.substring(0, 200)}`,
        );
      }

      // Extract component and template code
      const { componentCode, templateCode } =
        this.promptService.extractCustomComponent(rawResponse);

      this.logger.log('Successfully generated custom component');
      return {
        componentCode,
        templateCode,
      };
    } catch (error) {
      this.logger.error(`Custom component generation failed: ${error.message}`);
      throw new Error(`Failed to generate custom component: ${error.message}`);
    }
  }
}
