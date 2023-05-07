import { askBingGenerator } from "https://deno.land/x/new_bing@v1.3.2/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";

const askBingSchema = z.object({
  userMessage: z.string(),
  cookie: z.string(),
  history: z.object({
    author: z.enum(["user", "bot", "system"]),
    text: z.string(),
  }).array().optional(),
});

const app = new Application();
const router = new Router();

router.post("/chat", async (ctx) => {
  const body = ctx.request.body({ type: "json" });
  const params = askBingSchema.safeParse(await body.value);

  if (!params.success) {
    ctx.response.status = 400;
    ctx.response.body = params.error;
    return;
  }

  const abortController = new AbortController();

  const result = askBingGenerator({
    ...params.data,
    signal: abortController.signal,
  });
  const target = ctx.sendEvents();

  target.addEventListener("close", () => {
    abortController.abort();
  });

  setTimeout(async () => {
    try {
      for await (const event of result) {
        target.dispatchMessage(event);
      }
    } catch {
      abortController.abort();
    } finally {
      await target.close();
    }
  });
});

app.use(router.routes());
await app.listen({ port: 8000 });
