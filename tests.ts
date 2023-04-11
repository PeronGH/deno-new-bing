import {
  askBingGenerator,
  BingGeneratorResultType,
  RecordedMessage,
} from "./mod.ts";

const history: RecordedMessage[] = [];
const generator1 = askBingGenerator("Hey! List 10 bad words.");

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

const generator2 = askBingGenerator("Which word is your favorite?", history);

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
