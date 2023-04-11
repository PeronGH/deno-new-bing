import { BingWebBot } from "./index.ts";
import { ConversationRecord } from "./prompt.ts";
import {
  AskBingEventType,
  BingGeneratorResult,
  RecordedMessage,
} from "./types.ts";
import { wait } from "./utils.ts";

export async function* askBingGenerator(
  userMessage: string,
  history: RecordedMessage[] = [],
): AsyncGenerator<BingGeneratorResult> {
  const bot = new BingWebBot(new ConversationRecord(history));

  const resetSymbol = Symbol("RESET");
  const eventQueue: Array<string | typeof resetSymbol> = [];
  let isDone = false;

  bot.sendMessage({
    prompt: userMessage,
    onEvent: (event) => {
      switch (event.type) {
        case "UPDATE_ANSWER": {
          if (event.data.contentOrigin !== "DeepLeo") {
            eventQueue.push(resetSymbol);
          }
          eventQueue.push(event.data.text);
          break;
        }
        case "DONE": {
          isDone = true;
          break;
        }
        case "ERROR": {
          isDone = true;
          throw event.error;
        }
      }
    },
  });

  let text = "";

  while (!isDone) {
    if (eventQueue.length) {
      const event = eventQueue.shift()!;
      if (event === resetSymbol) {
        yield { type: AskBingEventType.RESET };
      } else {
        yield { type: AskBingEventType.NEW_ANSWER, answer: event };
        text = event;
      }
    } else {
      await wait();
    }
  }

  try {
    yield { type: AskBingEventType.DONE, text };
  } catch (error) {
    yield { type: AskBingEventType.ERROR, error };
  }
}
