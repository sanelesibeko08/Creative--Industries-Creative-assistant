import { env } from "../env";
import type { GenerateTextFn, GenerateTextResult } from "./types";

const MODEL_ID = "ibm/granite-13b-instruct-v2";
const IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";
const API_VERSION = "2023-05-29";

// ── IAM token cache ───────────────────────────────────────────
interface TokenCache {
  token: string;
  expiresAt: number; // unix ms
}

let _tokenCache: TokenCache | null = null;

async function getIAMToken(): Promise<string> {
  // Reuse cached token if it has more than 60 seconds of life remaining
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  if (!env.WATSONX_API_KEY) {
    throw new Error("WATSONX_API_KEY is not set. Add it to .env.local.");
  }

  const res = await fetch(IAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: env.WATSONX_API_KEY,
    }),
  });

  if (!res.ok) {
    throw new Error(`IAM token request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return _tokenCache.token;
}

// ── Text generation ───────────────────────────────────────────

export const generateText: GenerateTextFn = async (
  systemPrompt,
  userMessage,
  options = {},
): Promise<GenerateTextResult> => {
  if (!env.WATSONX_URL) {
    throw new Error("WATSONX_URL is not set. Add it to .env.local.");
  }
  if (!env.WATSONX_PROJECT_ID) {
    throw new Error("WATSONX_PROJECT_ID is not set. Add it to .env.local.");
  }

  let token: string;
  try {
    token = await getIAMToken();
  } catch (err) {
    throw new Error(`watsonx: failed to obtain IAM token — ${String(err)}`);
  }

  const url = `${env.WATSONX_URL}/ml/v1/text/generation?version=${API_VERSION}`;

  // Granite instruct models use a single concatenated prompt string
  const prompt = `<|system|>\n${systemPrompt}\n<|user|>\n${userMessage}\n<|assistant|>\n`;

  const body = {
    model_id: MODEL_ID,
    input: prompt,
    project_id: env.WATSONX_PROJECT_ID,
    parameters: {
      max_new_tokens: options.maxTokens ?? 800,
      temperature: options.temperature ?? 0.8,
      decoding_method: "sample",
    },
  };

  const makeRequest = async (accessToken: string) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

  let res = await makeRequest(token);

  // If 401, token may have just expired — refresh once and retry
  if (res.status === 401) {
    _tokenCache = null;
    const freshToken = await getIAMToken();
    res = await makeRequest(freshToken);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`watsonx generation failed: ${res.status} ${res.statusText} — ${detail}`);
  }

  const data = (await res.json()) as {
    results: Array<{ generated_text: string }>;
  };

  const text = data.results?.[0]?.generated_text ?? "";
  return { text, provider: "watsonx" };
};
