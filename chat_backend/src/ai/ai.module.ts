import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { PromptService } from './prompt.service';
import { SchemaValidatorService } from './schema-validator.service';

@Module({
  imports: [ConfigModule],
  providers: [LlmService, PromptService, SchemaValidatorService],
  exports: [LlmService, PromptService, SchemaValidatorService],
})
export class AiModule {}
