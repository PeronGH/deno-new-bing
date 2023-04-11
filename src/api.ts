import { random } from "https://esm.sh/lodash-es@4.17.21";
import { ChatError, ConversationResponse, ErrorCode } from "./types.ts";
import { bingConfig } from "./config.ts";

// https://github.com/acheong08/EdgeGPT/blob/master/src/EdgeGPT.py#L32
function randomIP() {
  return `13.${random(104, 107)}.${random(0, 255)}.${random(0, 255)}`;
}

const API_ENDPOINT = "https://www.bing.com/turing/conversation/create";

export async function createConversation(): Promise<ConversationResponse> {
  const headers = {
    "x-ms-client-request-id": crypto.randomUUID(),
    "x-ms-useragent":
      "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32",
    "cookie": bingConfig.cookie,
  };

  let resp: ConversationResponse;
  try {
    resp = await fetch(API_ENDPOINT, { headers, redirect: "error" }).then(
      (res) => res.json(),
    );
    if (!resp.result) {
      throw new Error("Invalid response");
    }
  } catch (err) {
    console.error("retry bing create", err);
    resp = await fetch(API_ENDPOINT, {
      headers: { ...headers, "x-forwarded-for": randomIP() },
      redirect: "error",
    }).then((res) => res.json());
    if (!resp) {
      throw new Error(`Failed to fetch (${API_ENDPOINT})`);
    }
  }

  if (resp.result.value !== "Success") {
    const message = `${resp.result.value}: ${resp.result.message}`;
    if (resp.result.value === "UnauthorizedRequest") {
      throw new ChatError(message, ErrorCode.BING_UNAUTHORIZED);
    }
    if (resp.result.value === "Forbidden") {
      throw new ChatError(message, ErrorCode.BING_FORBIDDEN);
    }
    throw new Error(message);
  }
  return resp;
}
