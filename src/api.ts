import { random } from "https://esm.sh/lodash-es@4.17.21";
import { ChatError, ConversationResponse, ErrorCode } from "./types.ts";

// https://github.com/acheong08/EdgeGPT/blob/master/src/EdgeGPT.py#L32
function randomIP() {
  return `13.${random(104, 107)}.${random(0, 255)}.${random(0, 255)}`;
}

const API_ENDPOINT =
  "https://edgeservices.bing.com/edgesvc/turing/conversation/create";

export async function createConversation(
  cookie: string,
): Promise<ConversationResponse> {
  const headers = {
    "x-ms-client-request-id": crypto.randomUUID(),
    "x-ms-useragent":
      "azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32",
    cookie,
  };

  const resp = await fetch(API_ENDPOINT, {
    headers: { ...headers, "x-forwarded-for": randomIP() },
    redirect: "error",
  });

  let resJSON: ConversationResponse;
  try {
    resJSON = await resp.json();
  } catch {
    throw new Error(`Failed to fetch (${API_ENDPOINT})`);
  }

  if (resJSON.result.value !== "Success") {
    const message = `${resJSON.result.value}: ${resJSON.result.message}`;
    if (resJSON.result.value === "UnauthorizedRequest") {
      throw new ChatError(message, ErrorCode.BING_UNAUTHORIZED);
    }
    if (resJSON.result.value === "Forbidden") {
      throw new ChatError(message, ErrorCode.BING_FORBIDDEN);
    }
    throw new Error(message);
  }
  return resJSON;
}
