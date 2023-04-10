export class ChatError extends Error {
  code: ErrorCode;
  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
  }
}

export interface ConversationResponse {
  conversationId: string;
  clientId: string;
  conversationSignature: string;
  result: {
    value: string;
    message: null;
  };
}

export enum InvocationEventType {
  Invocation = 1,
  StreamItem = 2,
  Completion = 3,
  StreamInvocation = 4,
  CancelInvocation = 5,
  Ping = 6,
  Close = 7,
}

export enum BingConversationStyle {
  Creative = "creative",
  Balanced = "balanced",
  Precise = "precise",
}

export enum ErrorCode {
  CONVERSATION_LIMIT = "CONVERSATION_LIMIT",
  UNKOWN_ERROR = "UNKOWN_ERROR",
  CHATGPT_CLOUDFLARE = "CHATGPT_CLOUDFLARE",
  CHATGPT_UNAUTHORIZED = "CHATGPT_UNAUTHORIZED",
  BING_UNAUTHORIZED = "BING_UNAUTHORIZED",
  BING_FORBIDDEN = "BING_FORBIDDEN",
  API_KEY_NOT_SET = "API_KEY_NOT_SET",
  BARD_EMPTY_RESPONSE = "BARD_EMPTY_RESPONSE",
}

// https://github.com/bytemate/bingchat-api/blob/main/src/lib.ts

export interface ConversationInfo {
  conversationId: string;
  clientId: string;
  conversationSignature: string;
  invocationId: number;
  conversationStyle: BingConversationStyle;
}

export interface BingChatResponse {
  conversationSignature: string;
  conversationId: string;
  clientId: string;
  invocationId: number;
  conversationExpiryTime: Date;
  response: string;
  details: ChatResponseMessage;
}

export interface ChatResponseMessage {
  text: string;
  author: string;
  createdAt: Date;
  timestamp: Date;
  messageId: string;
  messageType?: string;
  requestId: string;
  offense: string;
  adaptiveCards: AdaptiveCard[];
  sourceAttributions: SourceAttribution[];
  feedback: Feedback;
  contentOrigin: string;
  privacy: null;
  suggestedResponses: SuggestedResponse[];
}

export interface AdaptiveCard {
  type: string;
  version: string;
  body: Body[];
}

export interface Body {
  type: string;
  text: string;
  wrap: boolean;
  size?: string;
}

export interface Feedback {
  tag: null;
  updatedOn: null;
  type: string;
}

export interface SourceAttribution {
  providerDisplayName: string;
  seeMoreUrl: string;
  searchQuery: string;
}

export interface SuggestedResponse {
  text: string;
  author: string;
  createdAt: Date;
  timestamp: Date;
  messageId: string;
  messageType: string;
  offense: string;
  feedback: Feedback;
  contentOrigin: string;
  privacy: null;
}

export function generateMarkdown(response: BingChatResponse) {
  // change `[^Number^]` to markdown link
  const regex = /\[\^(\d+)\^\]/g;
  const markdown = response.details.text.replace(regex, (_, p1) => {
    const sourceAttribution =
      response.details.sourceAttributions[Number(p1) - 1];
    return `[${sourceAttribution.providerDisplayName}](${sourceAttribution.seeMoreUrl})`;
  });
  return markdown;
}
