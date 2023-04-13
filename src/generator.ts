import { Event } from "./abstract-bot.ts";
import { BingWebBot } from "./index.ts";
import { ConversationRecord } from "./prompt.ts";
import { BingEventType, BingGeneratorEvent, RecordedMessage } from "./types.ts";
import { wait } from "./utils.ts";

type BingGeneratorParams = {
  cookie: string;
  userMessage: string;
  history?: RecordedMessage[];
  signal?: AbortSignal;
};

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
  { cookie, userMessage, history, signal }: BingGeneratorParams,
): AsyncGenerator<BingGeneratorEvent> {
  const bot = new BingWebBot(cookie, new ConversationRecord(history));

  const eventQueue: Event[] = [];

  const session = bot.sendMessage({
    prompt: userMessage,
    onEvent: (event) => eventQueue.push(event),
    signal,
  });

  let isDone = false;
  let text = "";

  while (!isDone) {
    if (eventQueue.length) {
      const event = eventQueue.shift()!;
      switch (event.type) {
        case "UPDATE_ANSWER": {
          if (event.data.contentOrigin !== "DeepLeo") {
            yield { type: BingEventType.RESET, text };
            text = "";
            break;
          }
          const answer = event.data.text.slice(text.length);
          if (!answer) break;
          yield { type: BingEventType.ANSWER, answer };
          text = event.data.text;
          break;
        }
        case "DONE": {
          yield { type: BingEventType.DONE, text };
          isDone = true;
          break;
        }
        case "ERROR": {
          const error = `${event.error.code}: ${event.error.message}`;
          yield { type: BingEventType.ERROR, error };
          break;
        }
        case "QUERY": {
          yield { type: BingEventType.QUERY, query: event.query };
          break;
        }
      }
    } else await wait();
  }

  try {
    await session;
    yield { type: BingEventType.DONE, text };
  } catch (error) {
    yield {
      type: BingEventType.ERROR,
      error: error instanceof Error ? error.message : error.toString(),
    };
  }
}
