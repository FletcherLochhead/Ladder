import { createOpenAI } from "@ai-sdk/openai";

const apiKey = process.env.OPENROUTER_API_KEY;
const baseURL = "https://openrouter.ai/api/v1";

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn(
    "[openrouter] OPENROUTER_API_KEY missing, AI features will fail until set.",
  );
}

/**
 * OpenRouter is OpenAI API-compatible, so we point the official OpenAI
 * provider at OpenRouter's base URL. Vercel AI SDK's `generateText` /
 * `streamText` work transparently.
 */
export const openrouter = createOpenAI({
  apiKey: apiKey ?? "missing",
  baseURL,
  headers: {
    "HTTP-Referer": "https://interntrack.app",
    "X-Title": "InternTrack",
  },
});

export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-5.5";
export const FAST_MODEL = "openai/gpt-5.4-mini";
