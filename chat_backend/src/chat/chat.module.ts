import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { FormGeneratorService } from '../forms/form-generator.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ChatController],
  providers: [FormGeneratorService],
})
export class ChatModule {}
