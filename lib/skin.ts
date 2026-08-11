import { apiRequest } from "@/lib/query-client";
import { SkinSnapshot } from "@shared/skin";

export async function scanSkin(imageBase64: string, saveSnapshot: boolean): Promise<{ snapshot: SkinSnapshot; creditsRemaining?: number }> {
  const response = await apiRequest("POST", "/api/skin/scan", {
    imageBase64,
    saveSnapshot,
    consentVersion: "skin-v1",
  });
  return response.json();
}

export async function getSkinHistory(): Promise<SkinSnapshot[]> {
  const response = await apiRequest("GET", "/api/skin/snapshots");
  return response.json();
}

export async function deleteSkinSnapshot(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/skin/snapshots/${id}`);
}