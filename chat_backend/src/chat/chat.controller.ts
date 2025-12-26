import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FormGeneratorService } from '../forms/form-generator.service';
import {
  ChatMessageDto,
  FormGenerationResponseDto,
  ChatResponseDto,
} from '../dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly formGeneratorService: FormGeneratorService) {}

  @Post('message')
  chat(@Body() chatMessage: ChatMessageDto): ChatResponseDto {
    const message = chatMessage.message.toLowerCase().trim();

    if (
      message === 'hello' ||
      message === 'hi' ||
      message === 'hey' ||
      message === 'good morning' ||
      message === 'good afternoon' ||
      message === 'good evening'
    ) {
      return {
        message:
          "Hello! I can help you generate forms. Here's how:\n\n" +
          '• Type "create a form" followed by your requirements\n' +
          '• Upload an image of a form using the 📷 button\n' +
          '• Example: "create a contact form with name, email, and message"\n\n' +
          'What would you like to create?',
        success: true,
      };
    }

    if (
      message.includes('help') ||
      message.includes('what can you do') ||
      message.includes('how does this work')
    ) {
      return {
        message:
          "I can generate Form.io schemas from your descriptions! Here's how:\n\n" +
          '📝 **Create from text:**\n' +
          'Say "create a form" followed by what you need:\n' +
          '  • "create a contact form with name, email, phone"\n' +
          '  • "create a registration form with username and password"\n\n' +
          '📷 **Create from image:**\n' +
          'Click the image button and upload a screenshot or photo of any form\n\n' +
          'The form will appear on the right side in real-time!',
        success: true,
      };
    }

    return {
      message:
        "I'm here to help you create forms! To get started:\n\n" +
        '• Say "create a form" and describe what you need\n' +
        '• Or upload an image of a form using the 📷 button\n\n' +
        'Try saying: "create a contact form"',
      success: true,
    };
  }

  @Post('generate-form')
  async generateForm(
    @Body() chatMessage: ChatMessageDto,
  ): Promise<FormGenerationResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Generating form for message: "${chatMessage.message.substring(0, 50)}..."`,
      );

      const result = await this.formGeneratorService.generateForm(
        chatMessage.message,
        chatMessage.conversationHistory,
        chatMessage.image,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`Form generated successfully in ${duration}ms`);

      return {
        formSchema: result.schema,
        css: result.css,
        message: 'Form generated successfully',
        success: true,
        metadata: {
          generationTime: duration,
          componentCount: result.schema.components.length,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Form generation failed after ${duration}ms: ${errorMessage}`,
      );

      if (errorMessage.includes('timeout')) {
        throw new HttpException(
          {
            formSchema: null,
            message:
              'Form generation timed out. Please try again with a simpler description.',
            success: false,
          },
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      if (errorMessage.includes('rate limit')) {
        throw new HttpException(
          {
            formSchema: null,
            message: 'Rate limit exceeded. Please try again in a moment.',
            success: false,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        {
          formSchema: null,
          message: `Failed to generate form: ${errorMessage}`,
          success: false,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-custom-component')
  async generateCustomComponent(
    @Body() chatMessage: ChatMessageDto,
  ): Promise<any> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Generating custom component for message: "${chatMessage.message.substring(0, 50)}..."`,
      );

      const result = await this.formGeneratorService.generateCustomComponent(
        chatMessage.message,
        chatMessage.conversationHistory,
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `Custom component generated successfully in ${duration}ms`,
      );

      return {
        componentCode: result.componentCode,
        templateCode: result.templateCode,
        message: 'Custom component generated successfully',
        success: true,
        metadata: {
          generationTime: duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Custom component generation failed after ${duration}ms: ${errorMessage}`,
      );

      throw new HttpException(
        {
          componentCode: null,
          templateCode: null,
          message: `Failed to generate custom component: ${errorMessage}`,
          success: false,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
