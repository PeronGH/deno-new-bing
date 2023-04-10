import { BingWebBot } from "./mod.ts";

const bot = new BingWebBot();

bot.sendMessage({
  prompt: "Hi, who are you?",
  onEvent(event) {
    console.log(event);
  },
});
