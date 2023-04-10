import { AbstractBot, SendMessageParams } from "./abstract-bot.ts";
import { createConversation } from "./api.ts";
import {
  BingConversationStyle,
  ChatError,
  ChatResponseMessage,
  ConversationInfo,
  ErrorCode,
  InvocationEventType,
} from "./types.ts";
import {
  convertMessageToMarkdown,
  getUserConfig,
  WebSocketWithUtils,
} from "./utils.ts";

const styleOptionMap: Record<BingConversationStyle, string> = {
  [BingConversationStyle.Balanced]: "harmonyv3",
  [BingConversationStyle.Creative]: "h3imaginative",
  [BingConversationStyle.Precise]: "h3precise",
};

export class BingWebBot extends AbstractBot {
  private conversationContext?: ConversationInfo;

  private buildChatRequest(conversation: ConversationInfo, message: string) {
    const styleOption = styleOptionMap[conversation.conversationStyle];
    return {
      arguments: [
        {
          source: "cib",
          optionsSets: [
            "deepleo",
            "nlu_direct_response_filter",
            "disable_emoji_spoken_text",
            "responsible_ai_policy_235",
            "enablemm",
            "dtappid",
            "rai253",
            "dv3sugg",
            styleOption,
          ],
          allowedMessageTypes: ["Chat", "InternalSearchQuery"],
          isStartOfSession: conversation.invocationId === 0,
          message: {
            author: "user",
            inputMethod: "Keyboard",
            text: message,
            messageType: "Chat",
          },
          conversationId: conversation.conversationId,
          conversationSignature: conversation.conversationSignature,
          participant: { id: conversation.clientId },
        },
      ],
      invocationId: conversation.invocationId.toString(),
      target: "chat",
      type: InvocationEventType.StreamInvocation,
    };
  }

  async doSendMessage(params: SendMessageParams) {
    if (!this.conversationContext) {
      const [conversation, { bingConversationStyle }] = await Promise.all([
        createConversation(),
        getUserConfig(),
      ]);
      this.conversationContext = {
        conversationId: conversation.conversationId,
        conversationSignature: conversation.conversationSignature,
        clientId: conversation.clientId,
        invocationId: 0,
        conversationStyle: bingConversationStyle,
      };
    }

    const conversation = this.conversationContext!;

    const wsu = new WebSocketWithUtils("wss://sydney.bing.com/sydney/ChatHub");

    wsu.addUnpackedMessageListener((events) => {
      for (const event of events) {
        if (JSON.stringify(event) === "{}") {
          wsu.sendPacked({ type: 6 });
          wsu.sendPacked(this.buildChatRequest(conversation, params.prompt));
          conversation.invocationId += 1;
        } else if (event.type === 6) {
          wsu.sendPacked({ type: 6 });
        } else if (event.type === 3) {
          params.onEvent({ type: "DONE" });
          wsu.removeAllListeners();
          wsu.close();
        } else if (event.type === 1) {
          if (event.arguments[0].messages) {
            const text = convertMessageToMarkdown(
              event.arguments[0].messages[0],
            );
            params.onEvent({ type: "UPDATE_ANSWER", data: { text } });
          }
        } else if (event.type === 2) {
          const messages = event.item.messages as ChatResponseMessage[];
          const limited = messages.some((message) =>
            message.contentOrigin === "TurnLimiter"
          );
          if (limited) {
            params.onEvent({
              type: "ERROR",
              error: new ChatError(
                "Sorry, you have reached chat turns limit in this conversation.",
                ErrorCode.CONVERSATION_LIMIT,
              ),
            });
          }
        } else if (event.type === 7) {
          params.onEvent({
            type: "ERROR",
            error: new ChatError(
              event.error || "Connection closed with an error.",
              ErrorCode.UNKNOWN_ERROR,
            ),
          });
        }
      }
    });

    wsu.addEventListener("close", () => {
      params.onEvent({ type: "DONE" });
    });

    params.signal?.addEventListener("abort", () => {
      wsu.removeAllListeners();
      wsu.close();
    });

    await wsu.open();
    wsu.sendPacked({ protocol: "json", version: 1 });
  }

  resetConversation() {
    this.conversationContext = undefined;
  }
}
