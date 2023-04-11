import { BingWebBot } from "./index.ts";
import { ConversationRecord } from "./prompt.ts";
import {
  BingGeneratorResult,
  BingGeneratorResultType,
  RecordedMessage,
} from "./types.ts";
import { wait } from "./utils.ts";

export async function askBing(
  userMessage: string,
  onNewToken: (token: string) => void,
  history: RecordedMessage[] = [],
): Promise<string> {
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

  return lastAnswer;
}

export async function* askBingGenerator(
  userMessage: string,
  history: RecordedMessage[] = [],
): AsyncGenerator<BingGeneratorResult> {
  const tokenQueue: string[] = [];
  let isDone = false;

  const result = askBing(
    userMessage,
    (token) => tokenQueue.push(token),
    history,
  ).then((fullText) => {
    isDone = true;
    return fullText;
  });

  while (!isDone) {
    if (tokenQueue.length) {
      yield { type: BingGeneratorResultType.TOKEN, token: tokenQueue.shift()! };
    } else {
      await wait();
    }
  }

  try {
    yield { type: BingGeneratorResultType.DONE, text: await result };
  } catch (error) {
    yield { type: BingGeneratorResultType.ERROR, error };
  }
}
