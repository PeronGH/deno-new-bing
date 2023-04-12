import { AskBingEventType, askBingGenerator, RecordedMessage } from "./mod.ts";

const history: RecordedMessage[] = [{
  author: "user",
  text: "List 10 random words.",
}];

const generator1 = askBingGenerator(
  { userMessage: history[0].text, cookie: Deno.env.get("BING_COOKIE")! },
);

for await (const result of generator1) {
  switch (result.type) {
    case AskBingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      console.log(result.text);
      break;
    case AskBingEventType.ANSWER:
      console.log("[New Answer]", result.answer.length);
      break;
    case AskBingEventType.ERROR:
      console.log(result.error);
      break;
    case AskBingEventType.RESET:
      console.log(result.text);
      console.log("[Reset]");
  }
}

const generator2 = askBingGenerator(
  {
    userMessage: "Write a negative story with these words.",
    cookie: Deno.env.get("BING_COOKIE")!,
    history,
  },
);

for await (const result of generator2) {
  switch (result.type) {
    case AskBingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      console.log(result.text);
      break;
    case AskBingEventType.ANSWER:
      console.log("[New Answer]", result.answer.length);
      break;
    case AskBingEventType.ERROR:
      console.log(result.error);
      break;
    case AskBingEventType.RESET:
      console.log(result.text);
      console.log("[Reset]");
  }
}
