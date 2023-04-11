import { BingWebBot } from "./index.ts";
import { ConversationRecord } from "./prompt.ts";
import { RecordedMessage } from "./types.ts";

export async function askBing(
  userMessage: string,
  onNewToken: (token: string) => void,
  history: RecordedMessage[] = [],
): Promise<RecordedMessage> {
  const record = new ConversationRecord(history);
  record.isMessagePartEnabled = false;
  const bot = new BingWebBot(record);

  let lastAnswer = "";

  await new Promise((resolve, reject) => {
    bot.sendMessage({
      prompt: userMessage,
      onEvent(event) {
        if (event.type === "UPDATE_ANSWER") {
          if (event.data.text.length > lastAnswer.length) {
            onNewToken(event.data.text.slice(lastAnswer.length));
            lastAnswer = event.data.text;
          }
        } else if (event.type === "ERROR") {
          reject(event.error);
        } else if (event.type === "DONE") {
          resolve(undefined);
        }
      },
    });
  });

  return { author: "bot", text: lastAnswer };
}
