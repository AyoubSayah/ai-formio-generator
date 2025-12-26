import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from '@langchain/core/messages';
import { ConversationMessage } from '../forms/form-schema.interface';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly chatGroq: ChatGroq;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;
  private readonly defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('groq.apiKey') || '';
    const model =
      this.configService.get<string>('groq.model') ||
      'meta-llama/llama-4-maverick-17b-128e-instruct';
    const temperature =
      this.configService.get<number>('groq.temperature') || 0.3;
    const maxTokens = this.configService.get<number>('groq.maxTokens') || 4000;

    this.defaultModel = model;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      this.logger.warn(
        'GROQ_API_KEY not configured! Please set it in .env file. Get your key from: https://console.groq.com/keys',
      );
    }

    this.chatGroq = new ChatGroq({
      apiKey,
      model,
      temperature,
      maxTokens,
    });

    this.logger.log(`Initialized LlmService with model: ${model}`);
  }

  private isVisionModel(model: string): boolean {
    return (
      model.includes('vision') ||
      model.includes('llama-3.2-11b') ||
      model.includes('llama-3.2-90b') ||
      model.includes('llama-4-scout') ||
      model.includes('scout')
    );
  }

  getModelForContent(hasImage: boolean): string {
    const configuredModel =
      this.configService.get<string>('groq.model') ||
      'meta-llama/llama-4-maverick-17b-128e-instruct';

    if (hasImage) {
      return 'meta-llama/llama-4-scout-17b-16e-instruct';
    }

    return configuredModel;
  }

  async generateSchema(messages: ConversationMessage[]): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(
          `Attempt ${attempt}/${this.maxRetries} to generate schema`,
        );

        const response = await this.invokeWithTimeout(messages);

        this.logger.log('Successfully generated schema');
        return response;
      } catch (error: unknown) {
        lastError = error as Error;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Attempt ${attempt} failed: ${errorMessage}`);

        if (this.isNonRetryableError(error)) {
          this.logger.error('Non-retryable error encountered');
          throw error;
        }

        if (attempt < this.maxRetries) {
          const delay = this.calculateBackoff(attempt);
          this.logger.log(`Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(`All ${this.maxRetries} attempts failed`);
    throw new Error(
      `Failed to generate schema after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    );
  }

  private async invokeWithTimeout(
    messages: ConversationMessage[],
  ): Promise<string> {
    const timeout = this.configService.get<number>('groq.timeout');

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out')), timeout);
    });

    const invokePromise = this.invoke(messages);

    return Promise.race([invokePromise, timeoutPromise]);
  }

  private async invoke(messages: ConversationMessage[]): Promise<string> {
    const hasImage = messages.some((msg) => Array.isArray(msg.content));
    const model = this.getModelForContent(hasImage);
    const chatInstance =
      hasImage && model !== this.defaultModel
        ? new ChatGroq({
            apiKey: this.configService.get<string>('groq.apiKey'),
            model,
            temperature:
              this.configService.get<number>('groq.temperature') || 0.3,
            maxTokens: this.configService.get<number>('groq.maxTokens') || 4000,
          })
        : this.chatGroq;

    if (hasImage) {
      this.logger.log(`Using vision model: ${model}`);
    }

    const langchainMessages = messages.map((msg) => {
      const content = msg.content;

      switch (msg.role) {
        case 'system':
          return new SystemMessage(
            typeof content === 'string' ? content : JSON.stringify(content),
          );
        case 'assistant':
          return new AIMessage(
            typeof content === 'string' ? content : JSON.stringify(content),
          );
        case 'user':
        default:
          if (typeof content === 'string') {
            return new HumanMessage(content);
          } else {
            return new HumanMessage({
              content: content.map((item) => {
                if (item.type === 'text') {
                  return {
                    type: 'text' as const,
                    text: item.text,
                  };
                } else {
                  return {
                    type: 'image_url' as const,
                    image_url: {
                      url: item.image_url.url,
                    },
                  };
                }
              }),
            });
          }
      }
    });

    const response = await chatInstance.invoke(langchainMessages);

    return String(response.content);
  }

  private calculateBackoff(attempt: number): number {
    const delay = this.baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * delay * 0.25;
    return delay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isNonRetryableError(error: unknown): boolean {
    const nonRetryableMessages = [
      'invalid api key',
      'api key not valid',
      'authentication failed',
      'unauthorized',
      'forbidden',
      'bad request',
    ];

    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : '';

    return nonRetryableMessages.some((msg) => errorMessage.includes(msg));
  }

  isConfigured(): boolean {
    const apiKey = this.configService.get<string>('groq.apiKey');
    return !!apiKey && apiKey !== 'your_groq_api_key_here';
  }
}
