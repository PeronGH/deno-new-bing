import { ChatResponseMessage } from "./types.ts";
export { random } from "https://esm.sh/lodash-es@4.17.21";

export function convertMessageToMarkdown(
  message: ChatResponseMessage,
): { text: string; isQuery: boolean } {
  if (message.messageType === "InternalSearchQuery") {
    return { isQuery: true, text: message.text };
  }
  for (const card of message.adaptiveCards) {
    for (const block of card.body) {
      if (block.type === "TextBlock") {
        return { isQuery: false, text: block.text };
      }
    }
  }
  return { isQuery: false, text: "" };
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
