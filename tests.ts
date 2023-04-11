import { AskBingEventType, askBingGenerator, RecordedMessage } from "./mod.ts";

const history: RecordedMessage[] = [{
  author: "user",
  text: "List 10 random words.",
}];

const generator1 = askBingGenerator(
  history[0].text,
);

for await (const result of generator1) {
  switch (result.type) {
    case AskBingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      console.log(result.text);
      break;
    case AskBingEventType.NEW_ANSWER:
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
  "Write a negative story with these words.",
  history,
);

for await (const result of generator2) {
  switch (result.type) {
    case AskBingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      console.log(result.text);
      break;
    case AskBingEventType.NEW_ANSWER:
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
