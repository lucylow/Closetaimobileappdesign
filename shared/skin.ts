export type SkinSeverityBand = "low" | "moderate" | "high" | "unknown";

export type SkinConcernKey =
  | "moisture"
  | "oiliness"
  | "texture"
  | "pores"
  | "redness"
  | "acne"
  | "radiance"
  | "spots"
  | "wrinkles"
  | string;

export interface SkinConcern {
  key: SkinConcernKey;
  score: number | null;
  label: string;
  severityBand: SkinSeverityBand;
  explanation: string;
  action: string;
}

export interface RoutineStep {
  time: "AM" | "PM";
  order: number;
  category: string;
  goal: string;
  notes: string;
  optional: boolean;
}

export interface StyleInsight {
  title: string;
  detail: string;
  colorFamilies?: string[];
}

export interface SkinSnapshot {
  id: string;
  userId?: string;
  createdAt: string | Date;
  source: "youcam" | "demo";
  imageRetention: "not_saved" | "temporary" | "saved_by_user";
  skinType: string | null;
  overallSummary: string;
  concerns: SkinConcern[];
  routine: RoutineStep[];
  styleInsights: StyleInsight[];
  modelVersion: string | null;
  consentVersion: string;
}

export const SKIN_ANALYSIS_CREDITS = 8;

const concernLabels: Record<string, string> = {
  moisture: "Hydration",
  hydration: "Hydration",
  oiliness: "Oil balance",
  texture: "Texture",
  pores: "Pores",
  redness: "Evenness",
  acne: "Breakouts",
  radiance: "Radiance",
  spots: "Spots",
  wrinkles: "Lines",
};

function scoreValue(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null;
}

function scoreBand(score: number | null): SkinSeverityBand {
  if (score === null) return "unknown";
  if (score >= 80) return "low";
  if (score >= 60) return "moderate";
  return "high";
}

export function buildSkinRoutine(concerns: SkinConcern[]): RoutineStep[] {
  const textureOrSpots = concerns.some((concern) =>
    ["texture", "spots", "acne"].includes(concern.key),
  );
  return [
    { time: "AM", order: 1, category: "Cleanse", goal: "Start fresh", notes: "Use a gentle cleanser and lukewarm water.", optional: false },
    { time: "AM", order: 2, category: "Moisturize", goal: "Support the skin barrier", notes: "Apply while skin is slightly damp.", optional: false },
    { time: "AM", order: 3, category: "Sunscreen", goal: "Protect your skin", notes: "Finish with broad-spectrum SPF 30 or higher.", optional: false },
    { time: "PM", order: 1, category: "Cleanse", goal: "Remove the day", notes: "Keep the evening cleanse gentle.", optional: false },
    { time: "PM", order: 2, category: textureOrSpots ? "Targeted care" : "Comfort care", goal: textureOrSpots ? "Support smoother-looking skin" : "Keep it calm", notes: "Optional: introduce one gentle product at a time.", optional: true },
    { time: "PM", order: 3, category: "Moisturize", goal: "Recover overnight", notes: "Choose a comfortable, non-irritating moisturizer.", optional: false },
  ];
}

export function buildSkinStyleInsights(concerns: SkinConcern[]): StyleInsight[] {
  const hasRedness = concerns.some((concern) => concern.key === "redness" && concern.severityBand === "high");
  return [
    {
      title: "Color direction",
      detail: hasRedness
        ? "Try soft neutrals and low-contrast layers if you want a calm, balanced look."
        : "Cream, camel, navy, and warm accents can frame your look without competing with your complexion.",
      colorFamilies: hasRedness ? ["Cream", "Stone", "Navy"] : ["Cream", "Camel", "Terracotta"],
    },
    {
      title: "Finishing touch",
      detail: "Use one intentional accessory and let the rest of the outfit stay easy.",
      colorFamilies: ["Gold", "Warm white"],
    },
  ];
}

export function normalizeSkinSnapshot(raw: any, id = "skin-snapshot"): SkinSnapshot {
  const result = raw?.result || raw?.data || raw || {};
  const rawConcerns = result.concerns || result.metrics || result.skin_metrics || result.analysis || [];
  const entries: Array<[string, any]> = Array.isArray(rawConcerns)
    ? rawConcerns.map((item: any, index: number) => [item?.key || item?.name || `concern-${index}`, item])
    : Object.entries(rawConcerns) as Array<[string, any]>;
  const concerns: SkinConcern[] = entries.slice(0, 6).map(([key, item]) => {
    const score = scoreValue(item?.score ?? item?.value ?? item?.level);
    const safeKey = String(key).toLowerCase().replace(/\s+/g, "_");
    return {
      key: safeKey,
      score,
      label: concernLabels[safeKey] || item?.label || String(key),
      severityBand: scoreBand(score),
      explanation: item?.explanation || "This is a visual signal from the current snapshot, not a diagnosis.",
      action: item?.action || "Keep your routine gentle and consistent.",
    };
  });
  const finalConcerns = concerns.length ? concerns : [
    {
      key: "moisture",
      score: null,
      label: "Hydration",
      severityBand: "unknown" as SkinSeverityBand,
      explanation: "No detailed concern score was returned.",
      action: "Use a gentle moisturizer and sunscreen.",
    },
  ];
  return {
    id,
    createdAt: new Date().toISOString(),
    source: "youcam",
    imageRetention: "not_saved",
    skinType: result.skin_type || result.skinType || null,
    overallSummary: result.summary || result.overall_summary || "Your snapshot is ready. Use these signals as gentle routine guidance.",
    concerns: finalConcerns,
    routine: result.routine || buildSkinRoutine(finalConcerns),
    styleInsights: result.styleInsights || buildSkinStyleInsights(finalConcerns),
    modelVersion: result.model_version || result.modelVersion || null,
    consentVersion: "skin-v1",
  };
}

export const demoSkinSnapshot: SkinSnapshot = {
  id: "demo-skin-snapshot",
  createdAt: "2026-08-08T09:00:00.000Z",
  source: "demo",
  imageRetention: "not_saved",
  skinType: "Balanced",
  overallSummary:
    "Your snapshot looks balanced with a little room to support hydration and radiance.",
  concerns: [
    {
      key: "moisture",
      score: 78,
      label: "Hydration",
      severityBand: "moderate",
      explanation: "Your skin may benefit from a little more everyday moisture support.",
      action: "Keep a gentle moisturizer in your AM and PM routine.",
    },
    {
      key: "radiance",
      score: 84,
      label: "Radiance",
      severityBand: "low",
      explanation: "Your complexion reads naturally bright in this snapshot.",
      action: "Protect that glow with daily sunscreen.",
    },
    {
      key: "texture",
      score: 72,
      label: "Texture",
      severityBand: "moderate",
      explanation: "A simple, consistent routine can help skin feel smoother over time.",
      action: "Avoid over-exfoliating and favor gentle cleansing.",
    },
    {
      key: "redness",
      score: 90,
      label: "Evenness",
      severityBand: "low",
      explanation: "Your skin tone appears fairly even in this image.",
      action: "Choose calming, fragrance-free basics if your skin feels sensitive.",
    },
  ],
  routine: [
    { time: "AM", order: 1, category: "Cleanse", goal: "Start fresh", notes: "Use a gentle cleanser and lukewarm water.", optional: false },
    { time: "AM", order: 2, category: "Moisturize", goal: "Support hydration", notes: "Apply while skin is slightly damp.", optional: false },
    { time: "AM", order: 3, category: "Sunscreen", goal: "Protect your glow", notes: "Finish with broad-spectrum SPF 30 or higher.", optional: false },
    { time: "PM", order: 1, category: "Cleanse", goal: "Remove the day", notes: "Keep the evening cleanse gentle.", optional: false },
    { time: "PM", order: 2, category: "Targeted care", goal: "Refine texture", notes: "Optional: introduce one gentle active at a time.", optional: true },
    { time: "PM", order: 3, category: "Moisturize", goal: "Recover overnight", notes: "Use a comfortable, non-irritating moisturizer.", optional: false },
  ],
  styleInsights: [
    { title: "Color direction", detail: "Soft neutrals and warm accents can keep the look polished without competing with your complexion.", colorFamilies: ["Cream", "Camel", "Terracotta"] },
    { title: "Finishing touch", detail: "A simple neckline and one reflective accessory can make the whole look feel intentional.", colorFamilies: ["Gold", "Warm white"] },
  ],
  modelVersion: "demo-v1",
  consentVersion: "skin-v1",
};