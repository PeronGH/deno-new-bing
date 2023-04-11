import { BingWebBot } from "./index.ts";
import { ConversationRecord } from "./prompt.ts";
import {
  AskBingEventType,
  BingGeneratorResult,
  RecordedMessage,
} from "./types.ts";
import { wait } from "./utils.ts";

/**
 * @param userMessage the message sent by the user
 * @param history the history of the conversation (excluding the initial system message and user message)
 * @param signal the signal to abort the conversation
 *
 * @returns an async generator that yields the following events:
 * - AskBingEventType.RESET: the bot has reset the answer
 * - AskBingEventType.NEW_ANSWER: the bot has a new answer
 * - AskBingEventType.DONE: the bot has finished answering the question
 * - AskBingEventType.ERROR: the bot has encountered an error
 */
export async function* askBingGenerator(
  userMessage: string,
  history: RecordedMessage[] = [],
  signal?: AbortSignal,
): AsyncGenerator<BingGeneratorResult> {
  const bot = new BingWebBot(new ConversationRecord(history));

  const resetSymbol = Symbol("RESET");
  const eventQueue: Array<string | typeof resetSymbol> = [];
  let isDone = false;

  const session = bot.sendMessage({
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
    signal,
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
    await session;
    yield { type: AskBingEventType.DONE, text };
  } catch (error) {
    yield { type: AskBingEventType.ERROR, error };
  }
}
