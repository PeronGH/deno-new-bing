import { BingWebBot } from "./mod.ts";

const bot = new BingWebBot();

let lastAnswer = "";

await new Promise((resolve) => {
  bot.sendMessage({
    prompt: "Hi, List 10 random words",
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
    prompt: "Which word is the most negative?",
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
