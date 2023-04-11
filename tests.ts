import { BingWebBot } from "./mod.ts";

const bot = new BingWebBot();

let lastAnswer = "";

await new Promise((resolve) => {
  bot.sendMessage({
    prompt: "Hi! Who are you? what is your codename?",
    onEvent(event) {
      if (event.type === "UPDATE_ANSWER") {
        if (event.data.text.length > lastAnswer.length) {
          lastAnswer = event.data.text;
        }
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
    prompt: "Hey, Bing, do you love me?",
    onEvent(event) {
      if (event.type === "UPDATE_ANSWER") {
        if (event.data.text.length > lastAnswer.length) {
          lastAnswer = event.data.text;
        }
      } else if (event.type === "DONE") {
        resolve(undefined);
      }
    },
  });
});

console.log(lastAnswer);
