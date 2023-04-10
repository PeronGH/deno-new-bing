import { BingConversationStyle, ChatResponseMessage } from "./types.ts";

export function convertMessageToMarkdown(message: ChatResponseMessage): string {
  if (message.messageType === "InternalSearchQuery") {
    return message.text;
  }
  for (const card of message.adaptiveCards) {
    for (const block of card.body) {
      if (block.type === "TextBlock") {
        return block.text;
      }
    }
  }
  return "";
}

const RecordSeparator = String.fromCharCode(30);

const websocketUtils = {
  // deno-lint-ignore no-explicit-any
  packMessage(data: any) {
    return `${JSON.stringify(data)}${RecordSeparator}`;
  },
  unpackMessage(data: string | ArrayBuffer | Blob) {
    return data
      .toString()
      .split(RecordSeparator)
      .filter(Boolean)
      .map((s) => JSON.parse(s));
  },
};

export class WebSocketWithUtils extends WebSocket {
  // deno-lint-ignore no-explicit-any
  sendPacked(data: any) {
    this.send(websocketUtils.packMessage(data));
  }

  addUnpackedMessageListener(
    // deno-lint-ignore no-explicit-any
    listener: (data: any[]) => void,
  ) {
    this.addEventListener("message", (event) => {
      listener(websocketUtils.unpackMessage(event.data));
    });
  }

  removeAllListeners() {
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.onopen = null;
  }

  open() {
    return new Promise((resolve) => {
      this.onopen = resolve;
    });
  }
}

// TODO: make this configurable
export const getUserConfig = () => ({
  bingConversationStyle: BingConversationStyle.Balanced,
});
