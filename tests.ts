import { askBing } from "./mod.ts";

const result = await askBing("Hello, who are you?", (token) => {
  console.log(token);
});

console.log(result);
