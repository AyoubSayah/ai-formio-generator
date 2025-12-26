import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import groqConfig from './config/groq.config';
import * as Joi from 'joi';

@Module({
  imports: [
    // Environment configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [groqConfig],
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        RATE_LIMIT_TTL: Joi.number().default(60),
        RATE_LIMIT_MAX: Joi.number().default(10),
        GROQ_API_KEY: Joi.string()
          .optional()
          .allow('', 'your_groq_api_key_here'),
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
      }),
    }),
    // Rate limiting to prevent abuse
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000, // Convert to milliseconds
        limit: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
      },
    ]),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
