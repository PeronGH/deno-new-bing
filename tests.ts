import { askBingGenerator, BingEventType, RecordedMessage } from "./mod.ts";

const history: RecordedMessage[] = [{
  author: "user",
  text: "Tell me what is Deno",
}];

const generator1 = askBingGenerator(
  { userMessage: history[0].text, cookie: Deno.env.get("BING_COOKIE")! },
);

for await (const result of generator1) {
  switch (result.type) {
    case BingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      console.log(result.text);
      break;
    case BingEventType.ANSWER:
      Deno.stdout.writeSync(new TextEncoder().encode(result.answer));
      break;
    case BingEventType.ERROR:
      console.log(result.error);
      break;
    case BingEventType.RESET:
      console.log(result.text);
      console.log("[Reset]");
      break;
    case BingEventType.QUERY:
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
    case BingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      console.log(result.text);
      break;
    case BingEventType.ANSWER:
      console.log("[New Answer]", result.answer.length);
      break;
    case BingEventType.ERROR:
      console.log(result.error);
      break;
    case BingEventType.RESET:
      console.log(result.text);
      console.log("[Reset]");
      break;
    case BingEventType.QUERY:
      console.log(result.query);
  }
}
