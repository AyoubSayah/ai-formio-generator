export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: string;
  customPrivate?: boolean;
  [key: string]: any;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormioComponent {
  type: string;
  key: string;
  label: string;
  input: boolean;
  validate?: ValidationRules;

  // Component-specific properties
  placeholder?: string;
  description?: string;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  hidden?: boolean;
  autofocus?: boolean;
  tabindex?: number;

  // Text field properties
  inputType?: string;
  inputMask?: string;

  // Select/Radio/Checkbox properties
  data?: {
    values?: SelectOption[];
    [key: string]: any;
  };
  values?: SelectOption[];

  // Textarea properties
  rows?: number;
  editor?: string;

  // Number properties
  delimiter?: boolean;
  requireDecimal?: boolean;

  // Date/Time properties
  format?: string;
  enableDate?: boolean;
  enableTime?: boolean;
  defaultDate?: string;

  // Button properties
  action?: string;
  theme?: string;
  block?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  shortcut?: string;
  disableOnInvalid?: boolean;

  // Layout properties
  tableView?: boolean;

  // Any other properties
  [key: string]: any;
}

export interface FormioSchema {
  display: 'form' | 'wizard' | 'pdf';
  components: FormioComponent[];
  title: string;
  name?: string;
  path?: string;
  type?: string;
  tags?: string[];
  [key: string]: any;
}

export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string; // base64 data URL or HTTP URL
  };
}

export interface TextContent {
  type: 'text';
  text: string;
}

export type MessageContent = string | Array<TextContent | ImageContent>;

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
}
