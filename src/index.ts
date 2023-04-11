import { AbstractBot, SendMessageParams } from "./abstract-bot.ts";
import { createConversation } from "./api.ts";
import { ConversationRecord } from "./prompt.ts";
import {
  ChatError,
  ChatResponseMessage,
  ConversationInfo,
  ErrorCode,
  InvocationEventType,
} from "./types.ts";
import { convertMessageToMarkdown, WebSocketWithUtils } from "./utils.ts";

export class BingWebBot extends AbstractBot {
  constructor(private history = new ConversationRecord()) {
    super();
  }

  private buildChatRequest(conversation: ConversationInfo, message: string) {
    this.history.add("user", message);

    return {
      arguments: [
        {
          source: "cib",
          optionsSets: [
            "deepleo",
            // "nlu_direct_response_filter",
            "disable_emoji_spoken_text",
            // "responsible_ai_policy_235",
            "enablemm",
            // "dtappid",
            // "rai253",
            // "dv3sugg",
            "h3imaginative",
            "nointernalsugg",
            "gencontentv3",
            "nodlcpcwrite",
            "dl_edge_prompt",
          ],
          allowedMessageTypes: ["Chat", "InternalSearchQuery"],
          isStartOfSession: conversation.invocationId === 0,
          message: {
            author: "user",
            text: "",
            messageType: "SearchQuery",
          },
          conversationId: conversation.conversationId,
          conversationSignature: conversation.conversationSignature,
          participant: { id: conversation.clientId },
          previousMessages: [this.history.toPreviousMessage()],
        },
      ],
      invocationId: conversation.invocationId.toString(),
      target: "chat",
      type: InvocationEventType.StreamInvocation,
    };
  }

  async doSendMessage(params: SendMessageParams) {
    // always create a new conversation due to jailbreak
    const conversation = await createConversation();
    const conversationContext = {
      conversationId: conversation.conversationId,
      conversationSignature: conversation.conversationSignature,
      clientId: conversation.clientId,
      invocationId: 0,
    };

    const wsu = new WebSocketWithUtils("wss://sydney.bing.com/sydney/ChatHub");

    wsu.addUnpackedMessageListener((events) => {
      for (const event of events) {
        matchEvent:
        if (JSON.stringify(event) === "{}") {
          wsu.sendPacked({ type: 6 });
          wsu.sendPacked(
            this.buildChatRequest(conversationContext, params.prompt),
          );
          conversationContext.invocationId += 1;
        } else if (event.type === 6) {
          wsu.sendPacked({ type: 6 });
        } else if (event.type === 3) {
          params.onEvent({ type: "DONE" });
          wsu.removeAllListeners();
          wsu.close();
        } else if (event.type === 1) {
          if (event.arguments[0].messages) {
            const contentOrigin = event.arguments[0].messages[0].contentOrigin;

            const text = convertMessageToMarkdown(
              event.arguments[0].messages[0],
            );
            params.onEvent({
              type: "UPDATE_ANSWER",
              data: { text, contentOrigin },
            });
          }
        } else if (event.type === 2) {
          const success = event.item.result.value === "Success";
          if (!success) {
            params.onEvent({
              type: "ERROR",
              error: new ChatError(
                `${event.item.result.value}: ${event.item.result.message}`,
                ErrorCode.NOT_SUCCESS,
              ),
            });
            break matchEvent;
          }

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
            break matchEvent;
          }

          const offense = messages.some((message) =>
            message.offense !== "None"
          );
          if (offense) {
            params.onEvent({
              type: "ERROR",
              error: new ChatError(
                "Sorry, someone has said something offensive in this conversation.",
                ErrorCode.OFFENSIVE_FILTER,
              ),
            });
            break matchEvent;
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
    this.history = new ConversationRecord();
  }
}
