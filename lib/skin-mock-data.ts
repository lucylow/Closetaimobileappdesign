// Fictional demo-only skincare data. It is not medical advice or YouCam output.
// The live YouCam result remains available from the existing "New scan" flow.

export type SkinMockStatus = "Excellent" | "Good" | "Watch" | "Priority";

export interface SkinMockConcern {
  key: string;
  label: string;
  score: number;
  status: SkinMockStatus;
  description: string;
  action: string;
  icon: string;
}

export interface SkinProduct {
  id: string;
  name: string;
  category: "cleanser" | "serum" | "moisturizer" | "spf" | "treatment";
  price: number;
  size: string;
  why: string;
  usage: string;
  tags: string[];
}

export interface SkinMockRoutineStep {
  id: string;
  time: "AM" | "PM";
  order: number;
  title: string;
  product: string;
  instruction: string;
  duration: string;
  icon: string;
}

export interface SkinMockResult {
  id: string;
  createdAt: string;
  source: "demo";
  skinType: "Combination";
  overallScore: number;
  headline: string;
  summary: string;
  confidence: number;
  concerns: SkinMockConcern[];
  routine: SkinMockRoutineStep[];
  products: SkinProduct[];
  wardrobeAdvice: string[];
  progress: { label: string; value: number; change: number }[];
}

export const SKIN_MOCK_RESULT: SkinMockResult = {
  id: "mock-skin-2026-08-08",
  createdAt: "2026-08-08T08:45:00-04:00",
  source: "demo",
  skinType: "Combination",
  overallScore: 84,
  headline: "Balanced with a hydration opportunity",
  summary:
    "Your demo snapshot suggests a balanced combination profile. Hydration and radiance are strong, while pores and redness are lower-priority signals to monitor.",
  confidence: 92,
  concerns: [
    {
      key: "hydration",
      label: "Hydration",
      score: 78,
      status: "Good",
      description: "Comfortable moisture balance with room for extra hydration.",
      action: "Layer a lightweight moisturizer and keep the routine consistent.",
      icon: "water-outline",
    },
    {
      key: "oiliness",
      label: "Oil balance",
      score: 46,
      status: "Good",
      description: "Moderate oil activity, especially through the center of the face.",
      action: "Favor lightweight layers instead of stripping cleansers.",
      icon: "sparkles-outline",
    },
    {
      key: "texture",
      label: "Texture",
      score: 62,
      status: "Watch",
      description: "A gentle, repeatable routine can support a smoother-looking finish.",
      action: "Avoid over-exfoliating and introduce one active at a time.",
      icon: "scan-outline",
    },
    {
      key: "pores",
      label: "Pores",
      score: 72,
      status: "Good",
      description: "Pores are a lower-priority signal in this demo snapshot.",
      action: "Maintain gentle cleansing and daily sunscreen.",
      icon: "ellipse-outline",
    },
    {
      key: "redness",
      label: "Redness",
      score: 28,
      status: "Excellent",
      description: "Low visible redness signal in this demo profile.",
      action: "Continue with gentle, fragrance-conscious products.",
      icon: "flame-outline",
    },
    {
      key: "radiance",
      label: "Radiance",
      score: 81,
      status: "Excellent",
      description: "Your complexion reads naturally bright in this demonstration result.",
      action: "Protect the glow with consistent SPF.",
      icon: "sunny-outline",
    },
  ],
  routine: [
    { id: "am-1", time: "AM", order: 1, title: "Cleanse", product: "Gentle Daily Cleanser", instruction: "Use lukewarm water and keep the cleanse comfortable.", duration: "30 sec", icon: "water-outline" },
    { id: "am-2", time: "AM", order: 2, title: "Hydrate", product: "Hydrating Serum", instruction: "Press one lightweight layer into slightly damp skin.", duration: "20 sec", icon: "beaker-outline" },
    { id: "am-3", time: "AM", order: 3, title: "Protect", product: "Daily SPF 30+", instruction: "Finish with broad-spectrum sunscreen before getting dressed.", duration: "30 sec", icon: "sunny-outline" },
    { id: "pm-1", time: "PM", order: 1, title: "Reset", product: "Gentle Daily Cleanser", instruction: "Remove the day without scrubbing or over-cleansing.", duration: "30 sec", icon: "moon-outline" },
    { id: "pm-2", time: "PM", order: 2, title: "Treat", product: "Calming Recovery Serum", instruction: "Optional: introduce one gentle active at a time.", duration: "20 sec", icon: "sparkles-outline" },
    { id: "pm-3", time: "PM", order: 3, title: "Seal", product: "Barrier Cream", instruction: "Use a comfortable moisturizer to support overnight recovery.", duration: "20 sec", icon: "heart-outline" },
  ],
  products: [
    { id: "p1", name: "Gentle Daily Cleanser", category: "cleanser", price: 18, size: "150 ml", why: "Keeps the routine simple without making combination skin feel stripped.", usage: "AM + PM", tags: ["gentle", "daily"] },
    { id: "p2", name: "Hydrating Serum", category: "serum", price: 28, size: "30 ml", why: "Pairs naturally with the hydration opportunity in this demo result.", usage: "AM", tags: ["hydration", "lightweight"] },
    { id: "p3", name: "Barrier Cream", category: "moisturizer", price: 24, size: "50 ml", why: "Adds a comfortable moisture layer without complicating the routine.", usage: "AM + PM", tags: ["barrier", "comfort"] },
    { id: "p4", name: "Daily SPF 30+", category: "spf", price: 22, size: "50 ml", why: "Consistent sun protection supports the radiance you already have.", usage: "AM", tags: ["SPF", "daily"] },
    { id: "p5", name: "Calming Recovery Serum", category: "treatment", price: 32, size: "30 ml", why: "A low-complexity evening option for a calm, consistent routine.", usage: "PM", tags: ["calming", "night"] },
  ],
  wardrobeAdvice: [
    "For today: choose soft, neutral clothing colors if you want the skin/radiance result to remain the visual focus.",
    "For a polished look: pair the navy blazer with the white tee already in your demo wardrobe.",
    "For an evening look: use the leather jacket with the silk blouse for a higher-contrast style direction.",
    "These are style suggestions only. Your personal taste remains the deciding factor.",
  ],
  progress: [
    { label: "Hydration", value: 78, change: 8 },
    { label: "Radiance", value: 81, change: 4 },
    { label: "Texture", value: 62, change: 6 },
    { label: "Redness", value: 28, change: -5 },
  ],
};

export function mockResultForToday(): SkinMockResult {
  return {
    ...SKIN_MOCK_RESULT,
    id: `mock-skin-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}