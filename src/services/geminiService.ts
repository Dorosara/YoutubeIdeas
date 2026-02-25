import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ShortStrategy {
  problem: string;
  hook: string;
  cinematicScript: string;
  voiceover: string;
  scenes: string;
  seoTitle: string;
  keywords: string[];
  tags: string[];
  description: string;
  thumbnailText: string;
  thumbnailImageIdea: string;
  emotion: string;
}

export async function generateShortsStrategy(
  topic: string,
): Promise<ShortStrategy[]> {
  const prompt = `You are an expert YouTube Shorts strategist, SEO specialist, and cinematic script writer.

TOPIC: ${topic}

TASK:
1. Identify the TOP 5 real problems people face in this topic.
2. For each problem:
   - Write a CINEMATIC YouTube Shorts script (20–30 sec)
   - Use emotional storytelling + simple explanation
   - Include VOICEOVER lines
   - Add scene directions for visuals

3. For each Short generate:
A. SEO Title (high CTR, emotional, searchable)
B. High-traffic low-competition keywords
C. Tags (SEO optimized)
D. Description (SEO + engaging)
E. Thumbnail concept:
   - Thumbnail text (3–5 words)
   - Thumbnail image idea (clear visual description)
   - Emotion to show
F. Hook line for first 2 seconds

STYLE:
- Simple English
- Cinematic storytelling
- Fast-paced YouTube Shorts format
- Focus on problem -> realization -> solution -> motivation
- Avoid generic advice, be practical and visual

Before generating titles, identify:
1. High search intent keywords
2. Long-tail keywords with low competition
3. Keywords popular in India + global audience
4. Short-form YouTube trending search phrases
Use these keywords naturally in titles, tags, and description.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING },
            hook: { type: Type.STRING },
            cinematicScript: { type: Type.STRING },
            voiceover: { type: Type.STRING },
            scenes: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            thumbnailText: { type: Type.STRING },
            thumbnailImageIdea: { type: Type.STRING },
            emotion: { type: Type.STRING },
          },
          required: [
            "problem",
            "hook",
            "cinematicScript",
            "voiceover",
            "scenes",
            "seoTitle",
            "keywords",
            "tags",
            "description",
            "thumbnailText",
            "thumbnailImageIdea",
            "emotion",
          ],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as ShortStrategy[];
}

export async function generateThumbnailImage(
  idea: string,
  emotion: string,
  text: string,
): Promise<string> {
  const prompt = `YouTube Shorts Thumbnail. Mood: High contrast, emotional, dramatic lighting. Style: Realistic, sharp focus, vibrant colors. Expression: Strong human emotion (${emotion}). Visual Idea: ${idea}. Make sure to leave empty space for text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}
