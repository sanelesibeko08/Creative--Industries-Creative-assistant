import { env } from "./env";

// ── Types ─────────────────────────────────────────────────────

export interface GeneratedImage {
  dataUrl: string; // base64 data URL (data:image/jpeg;base64,...)
  prompt: string;
}

// ── Config ────────────────────────────────────────────────────

const HF_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
const TIMEOUT_MS = 30_000;
const COLD_START_RETRY_DELAY_MS = 12_000;

// ── Image generation ──────────────────────────────────────────

export async function generateImage(
  prompt: string,
  negativePrompt?: string,
): Promise<GeneratedImage> {
  if (!env.HF_API_TOKEN) {
    throw new Error("HF_API_TOKEN is not set. Add it to .env.local.");
  }

  const body = JSON.stringify({
    inputs: prompt,
    parameters: {
      negative_prompt: negativePrompt,
      num_inference_steps: 30,
      guidance_scale: 7.5,
    },
  });

  const headers = {
    Authorization: `Bearer ${env.HF_API_TOKEN}`,
    "Content-Type": "application/json",
  };

  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(HF_API_URL, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res = await fetchWithTimeout();

  // Handle cold-start: HF returns 503 while the model loads
  if (res.status === 503) {
    const payload = (await res.json().catch(() => ({}))) as { estimated_time?: number };
    const delay = payload.estimated_time
      ? Math.min(payload.estimated_time * 1000, COLD_START_RETRY_DELAY_MS)
      : COLD_START_RETRY_DELAY_MS;

    await sleep(delay);
    res = await fetchWithTimeout();
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Hugging Face image generation failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`,
    );
  }

  // Successful response is a raw image binary (image/jpeg or image/png)
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${contentType};base64,${base64}`;

  return { dataUrl, prompt };
}

// ── Helpers ───────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
