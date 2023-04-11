import { ChatResponseMessage } from "./types.ts";

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

export class WebSocketWithUtils extends WebSocket {
  // deno-lint-ignore no-explicit-any
  sendPacked(data: any) {
    this.send(`${JSON.stringify(data)}${RecordSeparator}`);
  }

  addUnpackedMessageListener(
    // deno-lint-ignore no-explicit-any
    listener: (data: any[]) => void,
  ) {
    this.addEventListener("message", (event) => {
      listener(
        (event.data.toString() as string)
          .split(RecordSeparator)
          .filter(Boolean)
          .map((s) => JSON.parse(s)),
      );
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

export const wait = (ms: number | undefined = undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));
