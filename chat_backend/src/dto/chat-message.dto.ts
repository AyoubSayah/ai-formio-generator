import {
  ConversationMessage,
  FormioSchema,
} from '../forms/form-schema.interface';

export class ChatMessageDto {
  message: string;
  image?: string; // base64 encoded image data
  conversationHistory?: ConversationMessage[];
}

export class FormGenerationResponseDto {
  formSchema: FormioSchema | null;
  css?: string | null;
  message: string;
  success: boolean;
  metadata?: {
    generationTime?: number;
    componentCount?: number;
    model?: string;
  };
}

export class ChatResponseDto {
  message: string;
  success: boolean;
}
