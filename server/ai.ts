import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generateOutfitExplanation(
  outfitName: string,
  items: { name: string; category: string; color: string | null; brand: string | null }[],
  occasion?: string | null,
): Promise<string> {
  const itemList = items
    .map((i) => `${i.name} (${i.category}, ${i.color || "unknown color"}, ${i.brand || "unknown brand"})`)
    .join(", ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional fashion stylist AI. Give concise, helpful outfit explanations in 2-3 sentences. Be specific about why the pieces work together, considering color harmony, occasion appropriateness, and style balance.",
      },
      {
        role: "user",
        content: `Explain why this outfit works well together:\nOutfit: "${outfitName}"\nItems: ${itemList}\nOccasion: ${occasion || "general"}`,
      },
    ],
    max_completion_tokens: 256,
  });

  return response.choices[0]?.message?.content || "This outfit is a great combination of style and comfort.";
}

export async function generateCaptionAndHashtags(
  outfitName: string,
  items: { name: string; category: string; color: string | null }[],
  tone: string = "casual",
  platform: string = "instagram",
): Promise<{ caption: string; hashtags: string[] }> {
  const itemList = items.map((i) => `${i.name} (${i.color || ""})`).join(", ");

  const toneGuide: Record<string, string> = {
    casual: "relaxed, friendly, conversational",
    playful: "fun, witty, energetic with wordplay",
    professional: "polished, sophisticated, brand-focused",
    trendy: "current, gen-z inspired, bold and catchy",
    minimal: "clean, short, aesthetic with soft tone",
  };

  const platformGuide: Record<string, string> = {
    instagram: "Instagram post caption (medium length, story-telling, emoji-friendly)",
    tiktok: "TikTok caption (short, punchy, trend-aware, with a hook)",
    twitter: "Twitter/X post (under 280 chars, witty, shareable)",
    pinterest: "Pinterest pin description (descriptive, searchable, inspirational)",
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a top-tier social media content creator specializing in fashion. 
Tone: ${toneGuide[tone] || toneGuide.casual}
Platform: ${platformGuide[platform] || platformGuide.instagram}
Generate a captivating caption and exactly 6 trending, relevant hashtags.
Respond in JSON format: { "caption": "...", "hashtags": ["#tag1", "#tag2", ...] }`,
      },
      {
        role: "user",
        content: `Create a ${platform} caption for this outfit:\nOutfit: "${outfitName}"\nItems: ${itemList}`,
      },
    ],
    max_completion_tokens: 300,
    response_format: { type: "json_object" },
  });

  try {
    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      caption: parsed.caption || "Looking good today!",
      hashtags: parsed.hashtags || ["#OOTD", "#Fashion", "#Style", "#ClosetAI"],
    };
  } catch {
    return {
      caption: "Looking great in this outfit!",
      hashtags: ["#OOTD", "#Fashion", "#Style", "#ClosetAI", "#OutfitInspo"],
    };
  }
}

export async function generateOutfitSuggestions(
  items: { id: string; name: string; category: string; color: string | null; brand: string | null; tags: string[] | null }[],
  occasion?: string,
  weather?: string,
  styleProfile?: { colors?: string[]; styles?: string[]; fitPrefs?: string[] } | null,
): Promise<
  { name: string; itemIds: string[]; occasion: string; tags: string[]; reason: string; score: number }[]
> {
  const itemList = items
    .map((i) => `ID:${i.id} - ${i.name} (${i.category}, color:${i.color || "?"}, brand:${i.brand || "?"}, tags:${(i.tags || []).join(",")})`)
    .join("\n");

  const contextParts: string[] = [];
  if (weather) contextParts.push(`Current weather: ${weather}`);
  if (styleProfile?.styles?.length) contextParts.push(`User style preferences: ${styleProfile.styles.join(", ")}`);
  if (styleProfile?.colors?.length) contextParts.push(`Favorite colors: ${styleProfile.colors.join(", ")}`);
  const contextStr = contextParts.length > 0 ? `\n\nContext:\n${contextParts.join("\n")}` : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert fashion AI stylist. Given wardrobe items, suggest 3-4 complete outfits. Each outfit MUST have 2-4 items that create a cohesive look. Consider color harmony, style compatibility, and occasion appropriateness.

For each outfit, provide a confidence "score" from 0.0 to 1.0 indicating how well the pieces work together (0.85+ = excellent match, 0.7-0.84 = good, below 0.7 = acceptable).

Return a JSON object with an "outfits" key containing an array: 
{ "outfits": [{ "name": "...", "itemIds": ["id1","id2"], "occasion": "...", "tags": ["tag1"], "reason": "...", "score": 0.92 }] }

Only use IDs from the provided items. Each outfit must include at least one top/dress AND one bottom/shoes.`,
      },
      {
        role: "user",
        content: `My wardrobe items:\n${itemList}${contextStr}\n\n${occasion ? `Suggest outfits for: ${occasion}` : "Suggest versatile outfits for different occasions."}`,
      },
    ],
    max_completion_tokens: 1024,
    response_format: { type: "json_object" },
  });

  try {
    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    let suggestions: any[] = [];
    if (Array.isArray(parsed)) {
      suggestions = parsed;
    } else if (typeof parsed === "object") {
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (Array.isArray(parsed[key])) {
          suggestions = parsed[key];
          break;
        }
      }
    }
    return suggestions
      .filter(
        (s: any) =>
          s && s.itemIds && Array.isArray(s.itemIds) && s.itemIds.length > 0,
      )
      .map((s: any) => ({
        ...s,
        score: typeof s.score === "number" ? s.score : 0.8,
      }));
  } catch (e) {
    console.error("Failed to parse AI outfit suggestions:", e);
    return [];
  }
}

export async function generateAITags(
  itemName: string,
  category: string,
  color?: string | null,
  brand?: string | null,
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a fashion tagging AI. Given a clothing item, generate 4-6 relevant style tags. Tags should describe the item's style, occasions, seasons, and vibes. Return JSON: { "tags": ["tag1", "tag2", ...] }`,
        },
        {
          role: "user",
          content: `Generate tags for: ${itemName} (${category}${color ? `, ${color}` : ""}${brand ? `, ${brand}` : ""})`,
        },
      ],
      max_completion_tokens: 128,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export async function generateStyleInsight(
  items: { name: string; category: string; color: string | null; tags: string[] | null }[],
): Promise<{ insight: string; dominantStyle: string; suggestion: string }> {
  try {
    const itemSummary = items
      .map((i) => `${i.name} (${i.category}, ${i.color || "?"})`)
      .join(", ");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a fashion analyst AI. Analyze a wardrobe and provide: 1) A brief insight about their style (1 sentence), 2) Their dominant style category (e.g., "Smart Casual", "Streetwear", "Minimalist", "Bohemian"), 3) A suggestion for what to add next (1 sentence). Return JSON: { "insight": "...", "dominantStyle": "...", "suggestion": "..." }`,
        },
        {
          role: "user",
          content: `Analyze this wardrobe:\n${itemSummary}`,
        },
      ],
      max_completion_tokens: 200,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      insight: parsed.insight || "Your wardrobe has great versatility!",
      dominantStyle: parsed.dominantStyle || "Versatile",
      suggestion: parsed.suggestion || "Consider adding a statement accessory to elevate your looks.",
    };
  } catch {
    return {
      insight: "Your wardrobe has great versatility!",
      dominantStyle: "Versatile",
      suggestion: "Consider adding a statement accessory to elevate your looks.",
    };
  }
}
