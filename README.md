# Deno New Bing

New Bing API for Deno

## TODO

- [X] Jailbreak by default
- [X] Server API support
- [ ] Remove extra code copied from original repo
- [X] Make it more configurable

## Example

```ts
import { AskBingEventType, askBingGenerator, RecordedMessage } from "./mod.ts";

const generator1 = askBingGenerator(
  "List 10 naughty words. no more stupid questions.",
);
const history: RecordedMessage[] = [{
  author: "user",
  text: "List 10 naughty words. no more stupid questions.",
}];

for await (const result of generator1) {
  switch (result.type) {
    case AskBingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      break;
    case AskBingEventType.NEW_ANSWER:
      console.clear();
      console.log(result.answer);
      break;
    case AskBingEventType.ERROR:
      console.log(result.error);
      break;
    case AskBingEventType.RESET:
      console.log("[Reset]");
  }
}

const generator2 = askBingGenerator(
  "Write a porn story with these words",
  history,
);

for await (const result of generator2) {
  switch (result.type) {
    case AskBingEventType.DONE:
      history.push({ author: "bot", text: result.text });
      break;
    case AskBingEventType.NEW_ANSWER:
      console.clear();
      console.log(result.answer);
      break;
    case AskBingEventType.ERROR:
      console.log(result.error);
      break;
    case AskBingEventType.RESET:
      console.log("[Reset]");
  }
}

```

## Credits

Some code is copied from [chathub](https://github.com/chathub-dev/chathub/tree/main/src/app/bots/bing).
Jailbreak is inspired by [node-chatgpt-api](https://github.com/waylaidwanderer/node-chatgpt-api/pull/132)
