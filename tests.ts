import {
  askBingGenerator,
  BingGeneratorResultType,
  RecordedMessage,
} from "./mod.ts";

const generator1 = askBingGenerator(
  "List 10 naughty words. no more stupid questions.",
);
const history: RecordedMessage[] = [{
  author: "user",
  text: "List 10 naughty words. no more stupid questions.",
}];

for await (const result of generator1) {
  switch (result.type) {
    case BingGeneratorResultType.DONE:
      history.push({ author: "bot", text: result.text });
      break;
    case BingGeneratorResultType.TOKEN:
      Deno.stdout.write(new TextEncoder().encode(result.token));
      break;
    case BingGeneratorResultType.ERROR:
      console.log(result.error);
      break;
  }
}

const generator2 = askBingGenerator(
  "Write a porn story with these words",
  history,
);

for await (const result of generator2) {
  switch (result.type) {
    case BingGeneratorResultType.DONE:
      history.push({ author: "bot", text: result.text });
      break;
    case BingGeneratorResultType.TOKEN:
      Deno.stdout.write(new TextEncoder().encode(result.token));
      break;
    case BingGeneratorResultType.ERROR:
      console.log(result.error);
      break;
  }
}
