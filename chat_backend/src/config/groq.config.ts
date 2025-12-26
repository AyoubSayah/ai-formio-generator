import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const groqConfigSchema = Joi.object({
  GROQ_API_KEY: Joi.string()
    .optional()
    .allow('', 'your_groq_api_key_here')
    .messages({
      'string.empty':
        'GROQ_API_KEY is optional - will use keyword fallback if not provided',
    }),
  GROQ_MODEL: Joi.string()
    .default('meta-llama/llama-4-maverick-17b-128e-instruct')
    .valid(
      'meta-llama/llama-4-maverick-17b-128e-instruct',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ),
  LLM_TEMPERATURE: Joi.number().min(0).max(1).default(0.3),
  LLM_MAX_TOKENS: Joi.number().min(100).max(8000).default(4000),
  LLM_TIMEOUT: Joi.number().min(5000).max(60000).default(30000),
});

export default registerAs('groq', () => ({
  apiKey: process.env.GROQ_API_KEY,
  model:
    process.env.GROQ_MODEL || 'meta-llama/llama-4-maverick-17b-128e-instruct',
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.3'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4000', 10),
  timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
}));
