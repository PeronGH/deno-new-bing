import { AskBingEventType, askBingGenerator, RecordedMessage } from "./mod.ts";

const history: RecordedMessage[] = [{
  author: "user",
  text: "Tell me what is Deno",
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
      Deno.stdout.writeSync(new TextEncoder().encode(result.answer));
      break;
    case AskBingEventType.ERROR:
      console.log(result.error);
      break;
    case AskBingEventType.RESET:
      console.log(result.text);
      console.log("[Reset]");
      break;
    case AskBingEventType.QUERY:
      console.log(result.query);
  }
}

const generator2 = askBingGenerator(
  {
    userMessage: "How is it compared to Node.js",
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
      break;
    case AskBingEventType.QUERY:
      console.log(result.query);
  }
}
