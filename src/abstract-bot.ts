import { ChatError, ErrorCode } from "./types.ts";

export type Event =
  | {
    type: "UPDATE_ANSWER";
    data: {
      text: string;
      contentOrigin: string;
    };
  }
  | {
    type: "DONE";
  }
  | {
    type: "ERROR";
    error: ChatError;
  };

export interface SendMessageParams {
  prompt: string;
  onEvent: (event: Event) => void;
  signal?: AbortSignal;
}

export abstract class AbstractBot {
  async sendMessage(params: SendMessageParams) {
    try {
      await this.doSendMessage(params);
    } catch (err) {
      console.error(err);
      if (err instanceof ChatError) {
        params.onEvent({ type: "ERROR", error: err });
      } else if (!params.signal?.aborted) {
        // ignore user abort exception
        params.onEvent({
          type: "ERROR",
          error: new ChatError((err as Error).message, ErrorCode.UNKNOWN_ERROR),
        });
      }
    }
  }

  abstract doSendMessage(params: SendMessageParams): Promise<void>;
  abstract resetConversation(): void;
}
