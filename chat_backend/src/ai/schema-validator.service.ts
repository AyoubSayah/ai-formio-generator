import { Injectable, Logger } from '@nestjs/common';
import { FormioSchema, FormioComponent } from '../forms/form-schema.interface';

@Injectable()
export class SchemaValidatorService {
  private readonly logger = new Logger(SchemaValidatorService.name);

  // Whitelist of allowed component types
  private readonly allowedComponentTypes = new Set([
    'textfield',
    'email',
    'phoneNumber',
    'textarea',
    'number',
    'checkbox',
    'radio',
    'select',
    'selectboxes',
    'datetime',
    'button',
    'password',
    'url',
    'day',
    'time',
    'currency',
    'address',
    'file',
    'hidden',
    'htmlelement',
    'panel',
    'columns',
    'fieldset',
    'table',
    'well',
    'container',
  ]);

  // Dangerous fields that should be removed
  private readonly dangerousFields = [
    'customClass',
    'customConditional',
    'calculateValue',
    'customDefaultValue',
    'customValidation',
  ];

  /**
   * Validate and sanitize an AI-generated Form.io schema
   */
  validateSchema(rawResponse: string): FormioSchema {
    try {
      // Step 1: Parse JSON
      const parsed = this.parseJSON(rawResponse);

      // Step 2: Validate structure
      this.validateStructure(parsed);

      // Step 3: Validate and sanitize components
      const sanitizedComponents = this.validateComponents(parsed.components);

      // Step 4: Ensure submit button exists
      const componentsWithSubmit = this.ensureSubmitButton(sanitizedComponents);

      // Step 5: Build final schema
      const validatedSchema: FormioSchema = {
        display: parsed.display || 'form',
        title: parsed.title || 'Form',
        components: componentsWithSubmit,
      };

      this.logger.log(
        `Schema validated successfully with ${validatedSchema.components.length} components`,
      );

      return validatedSchema;
    } catch (error) {
      this.logger.error(`Schema validation failed: ${error.message}`);
      throw new Error(`Invalid schema: ${error.message}`);
    }
  }

  /**
   * Parse JSON with better error handling
   */
  private parseJSON(rawResponse: string): any {
    try {
      return JSON.parse(rawResponse);
    } catch (_error) {
      const codeBlockMatch = rawResponse.match(
        /```(?:json)?\s*([\s\S]*?)\s*```/,
      );
      if (codeBlockMatch) {
        try {
          return JSON.parse(codeBlockMatch[1]);
        } catch (_innerError) {
          throw new Error('Invalid JSON in code block');
        }
      }

      throw new Error('Response is not valid JSON');
    }
  }

  /**
   * Validate basic schema structure
   */
  private validateStructure(schema: any): void {
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema must be an object');
    }

    if (!schema.components || !Array.isArray(schema.components)) {
      throw new Error('Schema must have a components array');
    }

    if (schema.components.length === 0) {
      throw new Error('Schema must have at least one component');
    }

    // Validate display type
    if (schema.display && !['form', 'wizard', 'pdf'].includes(schema.display)) {
      this.logger.warn(
        `Invalid display type "${schema.display}", defaulting to "form"`,
      );
      schema.display = 'form';
    }
  }

  /**
   * Validate and sanitize all components
   */
  private validateComponents(components: any[]): FormioComponent[] {
    const validatedComponents: FormioComponent[] = [];
    const usedKeys = new Set<string>();

    for (let i = 0; i < components.length; i++) {
      try {
        const component = this.validateComponent(components[i], usedKeys);
        validatedComponents.push(component);
      } catch (error) {
        this.logger.warn(
          `Skipping invalid component at index ${i}: ${error.message}`,
        );
        // Continue processing other components
      }
    }

    if (validatedComponents.length === 0) {
      throw new Error('No valid components found in schema');
    }

    return validatedComponents;
  }

  /**
   * Validate a single component
   */
  private validateComponent(
    component: any,
    usedKeys: Set<string>,
  ): FormioComponent {
    if (!component || typeof component !== 'object') {
      throw new Error('Component must be an object');
    }

    // Validate required fields
    if (!component.type || typeof component.type !== 'string') {
      throw new Error('Component must have a type field');
    }

    if (!this.allowedComponentTypes.has(component.type)) {
      throw new Error(`Component type "${component.type}" is not allowed`);
    }

    if (!component.key || typeof component.key !== 'string') {
      throw new Error('Component must have a key field');
    }

    // Ensure unique keys
    if (usedKeys.has(component.key)) {
      throw new Error(`Duplicate key "${component.key}" found`);
    }
    usedKeys.add(component.key);

    if (!component.label || typeof component.label !== 'string') {
      throw new Error('Component must have a label field');
    }

    if (component.input === undefined) {
      // Default to true for most components
      component.input = component.type !== 'htmlelement';
    }

    // Sanitize dangerous fields
    const sanitized = this.sanitizeComponent(component);

    return sanitized as FormioComponent;
  }

  /**
   * Remove dangerous or custom code fields
   */
  private sanitizeComponent(component: any): any {
    const sanitized = { ...component };

    // Remove dangerous fields
    for (const field of this.dangerousFields) {
      if (sanitized[field]) {
        this.logger.warn(
          `Removing dangerous field "${field}" from component "${component.key}"`,
        );
        delete sanitized[field];
      }
    }

    // Sanitize nested objects
    if (sanitized.conditional && typeof sanitized.conditional === 'object') {
      if (sanitized.conditional.json) {
        delete sanitized.conditional.json;
      }
    }

    // Sanitize validate object
    if (sanitized.validate && typeof sanitized.validate === 'object') {
      if (sanitized.validate.custom) {
        delete sanitized.validate.custom;
      }
      if (sanitized.validate.customPrivate) {
        delete sanitized.validate.customPrivate;
      }
    }

    return sanitized;
  }

  /**
   * Ensure a submit button exists at the end
   */
  private ensureSubmitButton(components: FormioComponent[]): FormioComponent[] {
    // Check if there's already a submit button
    const hasSubmitButton = components.some(
      (c) => c.type === 'button' && c.action === 'submit',
    );

    if (hasSubmitButton) {
      return components;
    }

    this.logger.log('Adding missing submit button');

    // Add a submit button
    return [
      ...components,
      {
        type: 'button',
        key: 'submit',
        label: 'Submit',
        input: true,
        action: 'submit',
        theme: 'primary',
      },
    ];
  }

  /**
   * Validate that keys are unique
   */
  private ensureUniqueKeys(components: FormioComponent[]): void {
    const keys = components.map((c) => c.key);
    const uniqueKeys = new Set(keys);

    if (keys.length !== uniqueKeys.size) {
      throw new Error('Duplicate keys found in components');
    }
  }
}
