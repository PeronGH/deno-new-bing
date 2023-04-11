import { askBing } from "./mod.ts";

const result = await askBing(
  "Hello, who are you?",
  (token) => Deno.stdout.writeSync(new TextEncoder().encode(token)),
);

console.log(result);
