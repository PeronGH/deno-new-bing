# Deno New Bing

New Bing API for Deno

## TODO

- [ ] Jailbreak by default
- [ ] Remove extra code copied from original repo
- [ ] Make it more configurable

## Example

```ts
import { BingWebBot } from "./mod.ts";

const bot = new BingWebBot();

bot.sendMessage({
  prompt: "Hi, who are you?",
  onEvent(event) {
    console.log(event);
  },
});
```

## Credits

Most code is copied from [chathub](https://github.com/chathub-dev/chathub/tree/main/src/app/bots/bing).
