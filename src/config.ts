import { BingConfig } from "./types.ts";

const cookie = Deno.env.get("BING_COOKIE");

if (!cookie) throw new Error("Bing cookie is not set");

export const bingConfig: BingConfig = {
  cookie,
};
