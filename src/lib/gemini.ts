import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LinkedInProfile } from "@/lib/linkedinScraper";

export class RateLimitError extends Error {
  constructor() {
    super("Rate limit exceeded");
    this.name = "RateLimitError";
  }
}

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenerationError";
  }
}

export type GeminiResponse =
  | { needsMoreInfo: true; questions: string[] }
  | { needsMoreInfo: false; post: string };

export function getApiKey(): string {
  const userKey = localStorage.getItem("gemini_api_key")?.trim();
  if (userKey) return userKey;
  return (import.meta.env.VITE_GEMINI_API_KEY as string) ?? "";
}

function sliderToTone(
  sliders: Record<string, number>
): Record<string, string> {
  const p = sliders.professional ?? 5;
  const s = sliders.serious ?? 5;
  const sh = sliders.short ?? 5;
  const sa = sliders.safe ?? 5;
  const pe = sliders.personal ?? 5;

  return {
    formality: p <= 4 ? "formal and professional" : p >= 7 ? "warm, friendly and approachable" : "balanced between professional and friendly",
    tone: s <= 4 ? "serious and authoritative" : s >= 7 ? "casual and conversational" : "balanced between serious and light",
    length: sh <= 4 ? "very short — maximum 80 words, 2–3 tight sentences, no lists" : sh >= 7 ? "long and detailed — include 3 numbered key takeaways, aim for 250–350 words" : "medium — 120–180 words, no lists needed",
    boldness: sa <= 4 ? "safe, measured and diplomatic" : sa >= 7 ? "bold, provocative and opinionated" : "moderately confident",
    voice: pe <= 4 ? "personal first-person storytelling voice" : pe >= 7 ? "corporate, brand-representative voice" : "a mix of personal and professional voice",
  };
}

export function buildPrompt(
  topic: string,
  role: string,
  sliders: Record<string, number>,
  toggles: Record<string, boolean>,
  followUpAnswers?: { question: string; answer: string }[],
  profile?: LinkedInProfile | null
): string {
  const tones = sliderToTone(sliders);

  // Build explicit DO and DO NOT rules for every toggle
  const formattingRules = [
    toggles.hook
      ? "DO start with a strong attention-grabbing hook (a bold statement, counterintuitive claim, or intriguing question)"
      : "DO NOT add any hook or dramatic opening line — start directly with the substance",
    toggles.emojis
      ? "DO sprinkle a few relevant emojis naturally throughout the post"
      : "DO NOT use any emojis whatsoever — none at all",
    toggles.cta
      ? "DO end with a compelling call-to-action that invites comments or discussion"
      : "DO NOT add any call-to-action or question at the end",
  ].join("\n- ");

  const profileSection = profile
    ? `\n\nPROFILE INFO (use this to personalise the post — match their voice and background):\n${[
        profile.name && `- Name: ${profile.name}`,
        profile.headline && `- Headline: ${profile.headline}`,
        profile.about && `- About: ${profile.about}`,
      ]
        .filter(Boolean)
        .join("\n")}`
    : "";

  const followUpSection =
    followUpAnswers && followUpAnswers.length > 0
      ? `\n\nThe user has provided additional details:\n${followUpAnswers
          .map((qa, i) => `${i + 1}. Q: ${qa.question}\n   A: ${qa.answer}`)
          .join("\n")}`
      : "";

  return `You are an expert LinkedIn content creator helping a ${role} craft a compelling, authentic LinkedIn post.

TONE & STYLE (follow every point exactly):
- Formality: ${tones.formality}
- Tone: ${tones.tone}
- Length: ${tones.length}
- Boldness: ${tones.boldness}
- Voice: ${tones.voice}

FORMATTING RULES (these are strict — obey every DO and DO NOT):
- ${formattingRules}

TOPIC/IDEA FROM THE USER:
"${topic}"${profileSection}${followUpSection}

TASK:
${
  followUpAnswers && followUpAnswers.length > 0
    ? `The user has answered your follow-up questions. Now write the full LinkedIn post using all available information. Obey every tone, length, and formatting rule above strictly.`
    : `First, evaluate whether you have enough specific, concrete details to write a compelling and authentic LinkedIn post.

A good LinkedIn post needs: specific context (dates, places, numbers, outcomes), emotional resonance, and concrete details — not vague statements.

Example of NOT enough detail: "I won a hackathon" (needs: when? where? what challenge? who else? what did you build? what did you learn?)
Example of ENOUGH detail: "Last weekend I won first place at HackMIT 2024 by building an AI tool that reduced hospital readmission rates by 40% in 48 hours with a team of 3."

If the topic lacks specific details, ask up to 3 focused questions to gather what you need.
If you have enough detail, write the post — obeying every tone, length, and formatting rule above strictly.`
}

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON — no markdown, no code fences, no extra text.

If you need more details:
{"needsMoreInfo": true, "questions": ["Question 1?", "Question 2?", "Question 3?"]}

If you have enough to write the post:
{"needsMoreInfo": false, "post": "The full LinkedIn post text here..."}

Respond with valid JSON only:`;
}

export async function callGemini(
  prompt: string,
  apiKey: string
): Promise<GeminiResponse> {
  if (!apiKey) {
    throw new GenerationError("No API key configured.");
  }

  let responseText = "";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    responseText = result.response.text().trim();

    // Strip markdown code fences if model wraps in them
    const cleaned = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as GeminiResponse;
    return parsed;
  } catch (err: unknown) {
    // Always log the real error so it's visible in DevTools
    console.error("[Gemini error]", err);

    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();

    // Only treat as rate limit when it's clearly a quota/429 issue
    if (
      msg.includes("429") ||
      lower.includes("resource_exhausted") ||
      lower.includes("resource has been exhausted") ||
      lower.includes("quota exceeded") ||
      lower.includes("quota_exceeded") ||
      lower.includes("too many requests")
    ) {
      throw new RateLimitError();
    }

    // Invalid / missing API key
    if (
      lower.includes("api key not valid") ||
      lower.includes("invalid api key") ||
      lower.includes("api_key_invalid") ||
      lower.includes("permission_denied") ||
      msg.includes("400") ||
      msg.includes("403")
    ) {
      throw new GenerationError(
        "Invalid API key. Please double-check the key you entered and save it again."
      );
    }

    // Bad JSON from the model
    if (responseText && (lower.includes("json") || !msg)) {
      throw new GenerationError(
        "The AI returned an unexpected format. Please try again."
      );
    }

    throw new GenerationError(msg || "Generation failed. Please try again.");
  }
}
