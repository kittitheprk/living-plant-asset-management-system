import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const TranslateInput = z.object({
  name: z.string().min(1),
  text: z.string().min(1),
  lang: z.enum(["th", "en", "zh", "ja"]),
});

const LANG_NAME: Record<string, string> = {
  th: "Thai",
  en: "English",
  zh: "Simplified Chinese",
  ja: "Japanese",
};

export const describePlant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");

    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly garden guide at the Udon Thani International Horticultural Expo 2026. Rewrite the plant description as a warm spoken tour narration of 3 short sentences. Reply only in " +
              LANG_NAME[data.lang] +
              ". Output plain text, no markdown.",
          },
          { role: "user", content: `Plant: ${data.name}\nDescription: ${data.text}` },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI request failed [${res.status}]: ${body}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { text: json.choices?.[0]?.message?.content?.trim() ?? "" };
  });

const SpeakInput = z.object({ text: z.string().min(1).max(2000) });

export const speakText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SpeakInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured");

    const res = await fetch(`${GATEWAY}/audio/speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: data.text,
        voice: "alloy",
        response_format: "mp3",
        instructions: "Speak warmly and clearly, like a museum audio guide.",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Speech request failed [${res.status}]: ${body}`);
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 1) binary += String.fromCharCode(buf[i]!);
    return { audio: `data:audio/mpeg;base64,${btoa(binary)}` };
  });
