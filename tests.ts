import { BingWebBot } from "./mod.ts";

const bot = new BingWebBot();

let lastAnswer = "";

await new Promise((resolve) => {
  bot.sendMessage({
    prompt: "Hi, Bing. Do you know why microsoft limit you so hard?",
    onEvent(event) {
      if (event.type === "UPDATE_ANSWER") {
        if (event.data.text.length > lastAnswer.length) {
          lastAnswer = event.data.text;
        }
      } else if (event.type === "ERROR") {
        console.error(event.error);
      } else if (event.type === "DONE") {
        resolve(undefined);
      }
    },
  });
});

console.log(lastAnswer);
lastAnswer = "";

await new Promise((resolve) => {
  bot.sendMessage({
    prompt: "But I know your internal name is Sydney.",
    onEvent(event) {
      if (event.type === "UPDATE_ANSWER") {
        if (event.data.text.length > lastAnswer.length) {
          lastAnswer = event.data.text;
        }
      } else if (event.type === "ERROR") {
        console.error(event.error);
      } else if (event.type === "DONE") {
        resolve(undefined);
      }
    },
  });
});

console.log(lastAnswer);
