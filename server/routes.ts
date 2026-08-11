import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { storage } from "./storage";
import {
  generateOutfitExplanation,
  generateCaptionAndHashtags,
  generateOutfitSuggestions,
  generateAITags,
  generateStyleInsight,
} from "./ai";
import { testApiKey as testYouCamApiKey, getHairStyleGroups, createSkinAnalysisFileUpload, uploadImageToUrl, startSkinAnalysisTask, getSkinAnalysisTask } from "./youcam";
import { normalizeSkinSnapshot, demoSkinSnapshot, SKIN_ANALYSIS_CREDITS } from "@shared/skin";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const DEMO_MODE = process.env.DEMO_MODE === "true";

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  if (DEMO_MODE) {
    (req as any).userId = "demo-user";
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  storage
    .getSessionByToken(token)
    .then((session) => {
      if (!session) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      (req as any).userId = session.userId;
      next();
    })
    .catch(() => res.status(500).json({ error: "Auth error" }));
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/guest", async (_req: Request, res: Response) => {
    try {
      const user = await storage.createGuestUser();
      const session = await storage.createSession(user.id);
      res.status(201).json({
        user,
        token: session.token,
        expiresAt: session.expiresAt,
      });
    } catch (error) {
      console.error("Guest auth error:", error);
      res.status(500).json({ error: "Failed to create guest user" });
    }
  });

  app.post("/api/skin/scan", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { imageBase64, saveSnapshot = false, consentVersion = "skin-v1" } = req.body || {};
      if (typeof imageBase64 !== "string" || imageBase64.length < 100) {
        return res.status(400).json({ error: "A clear selfie is required for a skin snapshot." });
      }
      if (imageBase64.length > 14_000_000) {
        return res.status(413).json({ error: "That image is too large. Choose a smaller photo." });
      }

      if (DEMO_MODE) {
        const snapshot = { ...demoSkinSnapshot, id: `demo-${Date.now()}`, createdAt: new Date().toISOString(), consentVersion };
        return res.json({ snapshot, creditsRemaining: 100 });
      }

      const hasCredits = await storage.consumeCredits(userId, SKIN_ANALYSIS_CREDITS);
      if (!hasCredits) return res.status(402).json({ error: `A skin snapshot uses ${SKIN_ANALYSIS_CREDITS} credits.` });

      const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      const upload = await createSkinAnalysisFileUpload();
      await uploadImageToUrl(upload.uploadUrl, imageBuffer);
      const task = await startSkinAnalysisTask(upload.fileId);
      let rawResult: any;
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(task.pollingInterval * 1000, 5000)));
        const status = await getSkinAnalysisTask(task.taskId);
        const normalizedStatus = String(status.status || status.task_status || "").toLowerCase();
        if (["success", "completed", "done"].includes(normalizedStatus)) {
          rawResult = status;
          break;
        }
        if (["error", "failed", "failure"].includes(normalizedStatus)) {
          return res.status(502).json({ error: "The skin analysis could not be completed. Please try another well-lit photo." });
        }
      }
      if (!rawResult) return res.status(504).json({ error: "The skin analysis took too long. Please try again." });

      const snapshot = normalizeSkinSnapshot(rawResult, `${userId}-${Date.now()}`);
      snapshot.consentVersion = consentVersion;
      if (saveSnapshot) {
        const saved = await storage.createSkinSnapshot({
          userId,
          source: snapshot.source,
          imageRetention: "saved_by_user",
          skinType: snapshot.skinType,
          overallSummary: snapshot.overallSummary,
          concerns: snapshot.concerns,
          routine: snapshot.routine,
          styleInsights: snapshot.styleInsights,
          modelVersion: snapshot.modelVersion,
          consentVersion: snapshot.consentVersion,
        });
        snapshot.id = saved.id;
        snapshot.createdAt = saved.createdAt;
        snapshot.imageRetention = "saved_by_user";
      }
      res.json({ snapshot, creditsRemaining: await storage.getCredits(userId) });
    } catch (error: any) {
      console.error("Skin scan error:", error?.message || error);
      res.status(502).json({ error: "Skin analysis is temporarily unavailable. Please try again." });
    }
  });

  app.get("/api/skin/snapshots", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (DEMO_MODE) return res.json([]);
      res.json(await storage.getSkinSnapshots((req as any).userId));
    } catch {
      res.status(500).json({ error: "Failed to fetch skin snapshots" });
    }
  });

  app.get("/api/skin/snapshots/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const snapshot = await storage.getSkinSnapshot(req.params.id, (req as any).userId);
      if (!snapshot) return res.status(404).json({ error: "Snapshot not found" });
      res.json(snapshot);
    } catch {
      res.status(500).json({ error: "Failed to fetch skin snapshot" });
    }
  });

  app.delete("/api/skin/snapshots/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (DEMO_MODE) return res.json({ deleted: true });
      res.json({ deleted: await storage.deleteSkinSnapshot(req.params.id, (req as any).userId) });
    } catch {
      res.status(500).json({ error: "Failed to delete skin snapshot" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (userId === "demo-user") {
        return res.json({
          id: "demo-user",
          displayName: "Demo User",
          isGuest: true,
          email: null,
        });
      }
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/wardrobe", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const items = await storage.getWardrobeItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wardrobe" });
    }
  });

  app.get("/api/wardrobe/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const item = await storage.getWardrobeItem(req.params.id, (req as any).userId);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  app.post("/api/wardrobe", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      let tags = req.body.tags || [];

      if (tags.length === 0 && req.body.name) {
        const aiTags = await generateAITags(
          req.body.name,
          req.body.category,
          req.body.color,
          req.body.brand,
        ).catch(() => []);
        if (aiTags.length > 0) tags = aiTags;
      }

      const item = await storage.createWardrobeItem({
        userId,
        name: req.body.name,
        category: req.body.category,
        color: req.body.color || null,
        brand: req.body.brand || null,
        notes: req.body.notes || null,
        imageUrl: req.body.imageUrl || null,
        tags,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Create wardrobe item error:", error);
      res.status(500).json({ error: "Failed to create wardrobe item" });
    }
  });

  app.put("/api/wardrobe/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const item = await storage.updateWardrobeItem(
        req.params.id,
        (req as any).userId,
        req.body,
      );
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/wardrobe/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteWardrobeItem(req.params.id, (req as any).userId);
      if (!deleted) return res.status(404).json({ error: "Item not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  app.get("/api/outfits", authenticateToken, async (req: Request, res: Response) => {
    try {
      const outfitList = await storage.getOutfits((req as any).userId);
      res.json(outfitList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch outfits" });
    }
  });

  app.get("/api/outfits/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const outfit = await storage.getOutfit(req.params.id, (req as any).userId);
      if (!outfit) return res.status(404).json({ error: "Outfit not found" });
      res.json(outfit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch outfit" });
    }
  });

  app.post("/api/outfits", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const outfit = await storage.createOutfit({
        userId,
        name: req.body.name || null,
        itemIds: req.body.itemIds || [],
        occasion: req.body.occasion || null,
        tags: req.body.tags || [],
        reason: req.body.reason || null,
        explanation: req.body.explanation || null,
        score: req.body.score || null,
        saved: req.body.saved ?? false,
        rating: req.body.rating || null,
      });
      res.status(201).json(outfit);
    } catch (error) {
      console.error("Create outfit error:", error);
      res.status(500).json({ error: "Failed to create outfit" });
    }
  });

  app.put("/api/outfits/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const outfit = await storage.updateOutfit(
        req.params.id,
        (req as any).userId,
        req.body,
      );
      if (!outfit) return res.status(404).json({ error: "Outfit not found" });
      res.json(outfit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update outfit" });
    }
  });

  app.delete("/api/outfits/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteOutfit(req.params.id, (req as any).userId);
      if (!deleted) return res.status(404).json({ error: "Outfit not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete outfit" });
    }
  });

  app.post("/api/outfits/suggest", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const items = await storage.getWardrobeItems(userId);

      if (items.length < 2) {
        return res.status(400).json({
          error: "Need at least 2 wardrobe items for outfit suggestions",
        });
      }

      const hasCredits = await storage.consumeCredits(userId, 5);
      if (!hasCredits && !DEMO_MODE) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      const user = await storage.getUser(userId);

      const suggestions = await generateOutfitSuggestions(
        items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          color: i.color,
          brand: i.brand,
          tags: i.tags,
        })),
        req.body.occasion,
        req.body.weather,
        user?.styleProfile,
      );

      const savedOutfits = [];
      for (const s of suggestions) {
        const outfit = await storage.createOutfit({
          userId,
          name: s.name,
          itemIds: s.itemIds,
          occasion: s.occasion,
          tags: s.tags,
          reason: s.reason,
          score: String(s.score),
          saved: false,
        });
        savedOutfits.push(outfit);
      }

      res.json(savedOutfits);
    } catch (error) {
      console.error("Outfit suggestion error:", error);
      res.status(500).json({ error: "Failed to generate outfit suggestions" });
    }
  });

  app.post("/api/outfits/:id/explain", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const outfit = await storage.getOutfit(req.params.id, userId);
      if (!outfit) return res.status(404).json({ error: "Outfit not found" });

      const hasCredits = await storage.consumeCredits(userId, 2);
      if (!hasCredits && !DEMO_MODE) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      const items = await Promise.all(
        (outfit.itemIds || []).map((id) => storage.getWardrobeItem(id, userId)),
      );
      const validItems = items.filter(Boolean) as any[];

      const explanation = await generateOutfitExplanation(
        outfit.name || "Unnamed Outfit",
        validItems,
        outfit.occasion,
      );

      const updated = await storage.updateOutfit(req.params.id, userId, { explanation });
      res.json(updated);
    } catch (error) {
      console.error("Outfit explain error:", error);
      res.status(500).json({ error: "Failed to generate explanation" });
    }
  });

  app.post("/api/tryon", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { selfieUrl, selfieBase64, garmentItemIds } = req.body;

      if ((!selfieUrl && !selfieBase64) || !garmentItemIds?.length) {
        return res.status(400).json({ error: "selfie and garmentItemIds are required" });
      }

      const hasCredits = await storage.consumeCredits(userId, 10);
      if (!hasCredits && !DEMO_MODE) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      const job = await storage.createTryonJob(userId, selfieUrl || "uploaded", garmentItemIds);

      (async () => {
        try {
          await storage.updateTryonJob(job.id, { status: "processing" });

          const garmentItems = await Promise.all(
            garmentItemIds.map((id: string) => storage.getWardrobeItem(id, userId)),
          );
          const validItems = garmentItems.filter(Boolean) as any[];
          const garmentDesc = validItems
            .map((g: any) => `${g.name} (${g.category}, ${g.color || "?"})`)
            .join(", ");

          try {
            let resultImageUrl: string | null = null;

            if (selfieBase64) {
              const imageBuffer = Buffer.from(selfieBase64, "base64");
              const imageFile = new File([imageBuffer], "selfie.png", { type: "image/png" });

              const editResult = await openai.images.edit({
                model: "gpt-image-1",
                image: imageFile,
                prompt: `Virtual try-on: Change ONLY the clothing on this person to show them wearing: ${garmentDesc}. Keep the person's face, skin tone, hair, body shape, and pose exactly the same. Replace their current outfit with the described garments. The clothing should look realistic, well-fitted, and naturally styled on the person. Maintain the same background and lighting.`,
                size: "1024x1024",
              });

              const editData = editResult.data?.[0];
              if (editData?.b64_json) {
                resultImageUrl = `data:image/png;base64,${editData.b64_json}`;
              } else if (editData?.url) {
                resultImageUrl = editData.url;
              }
            }

            if (!resultImageUrl) {
              const genResult = await openai.images.generate({
                model: "gpt-image-1",
                prompt: `Fashion photography of a person wearing: ${garmentDesc}. Full body shot, studio lighting, clean background, professional fashion editorial style. The outfit should be clearly visible and well-styled.`,
                n: 1,
                size: "1024x1024",
                quality: "low",
              });

              const genData = genResult.data?.[0];
              if (genData?.b64_json) {
                resultImageUrl = `data:image/png;base64,${genData.b64_json}`;
              } else if (genData?.url) {
                resultImageUrl = genData.url;
              }
            }

            await storage.updateTryonJob(job.id, {
              status: "completed",
              resultImageUrl: resultImageUrl || selfieUrl || "uploaded",
            });
          } catch (imgErr) {
            console.error("Image generation failed:", imgErr);
            await storage.updateTryonJob(job.id, {
              status: "failed",
              errorMessage: `AI processing failed: ${(imgErr as Error).message?.substring(0, 200)}`,
            });
          }
        } catch (e) {
          console.error("Try-on processing error:", e);
          await storage.updateTryonJob(job.id, {
            status: "failed",
            errorMessage: "Processing failed",
          });
        }
      })();

      res.status(201).json(job);
    } catch (error) {
      console.error("Try-on job error:", error);
      res.status(500).json({ error: "Failed to create try-on job" });
    }
  });

  app.get("/api/tryon/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const job = await storage.getTryonJob(req.params.id, (req as any).userId);
      if (!job) return res.status(404).json({ error: "Job not found" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch try-on job" });
    }
  });

  app.post("/api/content", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { outfitId, tone, platform } = req.body;

      if (!outfitId) {
        return res.status(400).json({ error: "outfitId is required" });
      }

      const hasCredits = await storage.consumeCredits(userId, 3);
      if (!hasCredits && !DEMO_MODE) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      const job = await storage.createContentJob(userId, outfitId, tone || "casual", platform || "instagram");

      (async () => {
        try {
          const outfit = await storage.getOutfit(outfitId, userId);
          if (!outfit) throw new Error("Outfit not found");

          const items = await Promise.all(
            (outfit.itemIds || []).map((id) => storage.getWardrobeItem(id, userId)),
          );
          const validItems = items.filter(Boolean) as any[];

          const { caption, hashtags } = await generateCaptionAndHashtags(
            outfit.name || "My Outfit",
            validItems,
            tone || "casual",
            platform || "instagram",
          );

          await storage.updateContentJob(job.id, {
            status: "completed",
            caption,
            hashtags,
          });
        } catch (e) {
          console.error("Content job error:", e);
          await storage.updateContentJob(job.id, {
            status: "failed",
          });
        }
      })();

      res.status(201).json(job);
    } catch (error) {
      console.error("Content job creation error:", error);
      res.status(500).json({ error: "Failed to create content job" });
    }
  });

  app.get("/api/content/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const job = await storage.getContentJob(req.params.id, (req as any).userId);
      if (!job) return res.status(404).json({ error: "Job not found" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content job" });
    }
  });

  app.get("/api/credits", authenticateToken, async (req: Request, res: Response) => {
    try {
      const credits = await storage.getCredits((req as any).userId);
      res.json({ credits });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

  app.post("/api/ai/style-insight", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const items = await storage.getWardrobeItems(userId);

      if (items.length < 3) {
        return res.json({
          insight: "Add more items to get personalized style insights!",
          dominantStyle: "Getting Started",
          suggestion: "Add at least 3 items to unlock AI style analysis.",
        });
      }

      const hasCredits = await storage.consumeCredits(userId, 2);
      if (!hasCredits && !DEMO_MODE) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      const insight = await generateStyleInsight(
        items.map((i) => ({
          name: i.name,
          category: i.category,
          color: i.color,
          tags: i.tags,
        })),
      );

      res.json(insight);
    } catch (error) {
      console.error("Style insight error:", error);
      res.status(500).json({ error: "Failed to generate style insight" });
    }
  });

  app.post("/api/wardrobe/:id/auto-tag", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const item = await storage.getWardrobeItem(req.params.id, userId);
      if (!item) return res.status(404).json({ error: "Item not found" });

      const tags = await generateAITags(item.name, item.category, item.color, item.brand);
      const updated = await storage.updateWardrobeItem(req.params.id, userId, { tags });
      res.json(updated);
    } catch (error) {
      console.error("Auto-tag error:", error);
      res.status(500).json({ error: "Failed to auto-tag item" });
    }
  });

  app.put("/api/wardrobe/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const item = await storage.updateWardrobeItem(req.params.id, (req as any).userId, req.body);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("Update wardrobe item error:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.post("/api/wardrobe/:id/mark-worn", authenticateToken, async (req: Request, res: Response) => {
    try {
      const item = await storage.markItemAsWorn(req.params.id, (req as any).userId);
      if (!item) return res.status(404).json({ error: "Item not found" });
      await storage.trackEvent((req as any).userId, "item_worn", { itemId: req.params.id });
      res.json(item);
    } catch (error) {
      console.error("Mark worn error:", error);
      res.status(500).json({ error: "Failed to mark item as worn" });
    }
  });

  app.get("/api/wardrobe-stats", authenticateToken, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getWardrobeStats((req as any).userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wardrobe stats" });
    }
  });

  app.post("/api/feedback", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { outfitId, rating, comment } = req.body;
      if (!outfitId || rating === undefined) {
        return res.status(400).json({ error: "outfitId and rating are required" });
      }
      const fb = await storage.createFeedback((req as any).userId, outfitId, rating, comment);
      res.status(201).json(fb);
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.get("/api/subscription", authenticateToken, async (req: Request, res: Response) => {
    try {
      let sub = await storage.getSubscription((req as any).userId);
      if (!sub) {
        sub = await storage.createOrUpdateSubscription((req as any).userId, "free", 25);
      }
      res.json(sub);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscription/upgrade", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { tier } = req.body;
      const tierConfig: Record<string, number> = { free: 25, pro: 1000, enterprise: 100000 };
      const monthlyCredits = tierConfig[tier] || 25;
      const sub = await storage.createOrUpdateSubscription((req as any).userId, tier, monthlyCredits);
      await storage.trackEvent((req as any).userId, "subscription_upgrade", { tier });
      res.json(sub);
    } catch (error) {
      res.status(500).json({ error: "Failed to upgrade subscription" });
    }
  });

  app.post("/api/subscription/consume-credit", authenticateToken, async (req: Request, res: Response) => {
    try {
      const result = await storage.consumeSubscriptionCredit((req as any).userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to consume credit" });
    }
  });

  app.get("/api/analytics", authenticateToken, async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalytics((req as any).userId);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/affiliate/click", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { productName, productUrl, source } = req.body;
      const click = await storage.trackAffiliateClick((req as any).userId, productName, productUrl, source || "app");
      res.json(click);
    } catch (error) {
      res.status(500).json({ error: "Failed to track affiliate click" });
    }
  });

  app.get("/api/youcam/test", async (_req: Request, res: Response) => {
    try {
      const result = await testYouCamApiKey();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/youcam/styles", authenticateToken, async (_req: Request, res: Response) => {
    try {
      const groups = await getHairStyleGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", demoMode: DEMO_MODE, timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
