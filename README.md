# Deno New Bing

New Bing API for Deno

## TODO

- [X] Jailbreak by default
- [X] Server API support
- [ ] Remove extra code copied from original repo
- [X] Make it more configurable

## Example

```ts
import { askBing } from "./mod.ts";

const result = await askBing(
  "Hello, who are you?",
  (token) => Deno.stdout.writeSync(new TextEncoder().encode(token)),
);

console.log(result);
```

## Credits

Some code is copied from [chathub](https://github.com/chathub-dev/chathub/tree/main/src/app/bots/bing).
Jailbreak is inspired by [node-chatgpt-api](https://github.com/waylaidwanderer/node-chatgpt-api/pull/132)
