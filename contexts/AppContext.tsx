import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import {
  WardrobeItem,
  Outfit,
  TryOnResult,
  CaptionResult,
  demoWardrobeItems,
  demoOutfits,
  demoCaptions,
} from '@/lib/demo-data';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from '@/lib/query-client';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  monthlyCredits: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    monthlyCredits: 25,
    features: ['3 Try-Ons/Day', 'Basic AI Styling', 'Watermarked Results', '25 Credits/Month'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    monthlyCredits: 1000,
    features: ['Unlimited Try-Ons', 'HD Results', 'Priority AI', '1,000 Credits/Month', 'Private Mode', 'Affiliate Earnings'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    monthlyCredits: 100000,
    features: ['White-Label Access', 'API Integration', 'Custom Model Training', '100K Credits/Month', 'Brand Dashboard', 'Dedicated Support'],
  },
];

interface AppState {
  isGuest: boolean;
  demoMode: boolean;
  isDark: boolean;
  hasSeenOnboarding: boolean;
  wardrobeItems: WardrobeItem[];
  outfits: Outfit[];
  savedOutfits: Outfit[];
  isLoading: boolean;
  credits: number;
  isAuthenticated: boolean;
  subscriptionTier: string;
  creditsUsed: number;
  monthlyCredits: number;
}

interface AppContextValue extends AppState {
  setDemoMode: (v: boolean) => void;
  toggleTheme: () => void;
  setHasSeenOnboarding: (v: boolean) => void;
  signInAsGuest: () => void;
  signOut: () => void;
  addWardrobeItem: (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'usageCount' | 'lastWorn'>) => Promise<void>;
  removeWardrobeItem: (id: string) => Promise<void>;
  updateWardrobeItem: (id: string, data: Partial<WardrobeItem>) => Promise<void>;
  markItemWorn: (id: string) => Promise<void>;
  rateOutfit: (id: string, rating: 'like' | 'neutral' | 'dislike') => void;
  saveOutfit: (id: string) => void;
  unsaveOutfit: (id: string) => void;
  generateOutfits: (occasion?: string, weather?: string) => Promise<void>;
  getExplanation: (id: string) => string;
  generateCaption: (outfitId: string, tone?: string, platform?: string) => Promise<CaptionResult>;
  createTryOn: (selfieUri: string, garmentIds: string[]) => Promise<TryOnResult>;
  refreshWardrobe: () => Promise<void>;
  getStyleInsight: () => Promise<{ insight: string; dominantStyle: string; suggestion: string }>;
  upgradeTier: (tier: string) => Promise<void>;
  canUseCredit: () => boolean;
  trackAffiliate: (productName: string, productUrl: string, source: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  WARDROBE: '@closetai_wardrobe',
  OUTFITS: '@closetai_outfits',
  SAVED_OUTFITS: '@closetai_saved_outfits',
  ONBOARDING: '@closetai_onboarding',
  THEME: '@closetai_theme',
  DEMO: '@closetai_demo',
  GUEST: '@closetai_guest',
};

function mapApiItemToLocal(apiItem: any): WardrobeItem {
  return {
    id: apiItem.id,
    name: apiItem.name,
    category: apiItem.category,
    color: apiItem.color || '',
    brand: apiItem.brand || '',
    imageUrl: apiItem.imageUrl || '',
    tags: apiItem.tags || [],
    usageCount: apiItem.usageCount || 0,
    lastWorn: apiItem.lastWornAt || null,
    notes: apiItem.notes || '',
    createdAt: apiItem.createdAt,
  };
}

function mapApiOutfitToLocal(apiOutfit: any, wardrobeItems: WardrobeItem[]): Outfit {
  const itemIds: string[] = apiOutfit.itemIds || [];
  const items = itemIds.map(id => wardrobeItems.find(w => w.id === id)).filter(Boolean) as WardrobeItem[];
  return {
    id: apiOutfit.id,
    name: apiOutfit.name || 'Untitled Outfit',
    items,
    tags: apiOutfit.tags || [],
    reason: apiOutfit.reason || '',
    occasion: apiOutfit.occasion || '',
    rating: apiOutfit.rating || null,
    saved: apiOutfit.saved || false,
    explanation: apiOutfit.explanation || '',
    score: apiOutfit.score ? parseFloat(apiOutfit.score) : 0.8,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(true);
  const [demoMode, setDemoModeState] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState(100);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [monthlyCredits, setMonthlyCredits] = useState(25);

  useEffect(() => {
    loadStoredState();
  }, []);

  const loadStoredState = async () => {
    try {
      const [onboarding, theme, demo, guest, wardrobe, saved] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.DEMO),
        AsyncStorage.getItem(STORAGE_KEYS.GUEST),
        AsyncStorage.getItem(STORAGE_KEYS.WARDROBE),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS),
      ]);

      if (onboarding === 'true') setHasSeenOnboardingState(true);
      if (theme === 'dark') setIsDark(true);
      if (demo === 'false') setDemoModeState(false);
      if (guest === 'true') setIsGuest(true);

      const token = await getAuthToken();
      const isLive = demo !== 'true' && demo !== null ? demo === 'false' : false;

      if (token && isLive) {
        setIsAuthenticated(true);
        try {
          await fetchRemoteData();
          return;
        } catch {
          setIsAuthenticated(false);
        }
      }

      if (wardrobe) {
        const parsed = JSON.parse(wardrobe) as WardrobeItem[];
        setWardrobeItems(parsed.length > 0 ? parsed : demoWardrobeItems);
      } else {
        setWardrobeItems(demoWardrobeItems);
      }

      if (saved) {
        setSavedOutfits(JSON.parse(saved));
      }

      setOutfits(demoOutfits);
    } catch {
      setWardrobeItems(demoWardrobeItems);
      setOutfits(demoOutfits);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRemoteData = async () => {
    try {
      const [wardrobeRes, outfitsRes, creditsRes] = await Promise.all([
        apiRequest('GET', '/api/wardrobe'),
        apiRequest('GET', '/api/outfits'),
        apiRequest('GET', '/api/credits'),
      ]);

      const apiItems: any[] = await wardrobeRes.json();
      const localItems = apiItems.map(mapApiItemToLocal);
      setWardrobeItems(localItems.length > 0 ? localItems : demoWardrobeItems);

      const apiOutfits: any[] = await outfitsRes.json();
      const localOutfits = apiOutfits.map(o => mapApiOutfitToLocal(o, localItems));
      setOutfits(localOutfits.length > 0 ? localOutfits : demoOutfits);
      setSavedOutfits(localOutfits.filter(o => o.saved));

      const creditsData = await creditsRes.json();
      setCredits(creditsData.credits || 0);

      try {
        const subRes = await apiRequest('GET', '/api/subscription');
        const subData = await subRes.json();
        setSubscriptionTier(subData.tier || 'free');
        setCreditsUsed(subData.creditsUsed || 0);
        setMonthlyCredits(subData.monthlyCredits || 25);
      } catch { /* subscription fetch optional */ }
    } catch (err) {
      console.warn('Failed to fetch remote data, falling back to demo:', err);
      setWardrobeItems(demoWardrobeItems);
      setOutfits(demoOutfits);
    } finally {
      setIsLoading(false);
    }
  };

  const persistWardrobe = useCallback(async (items: WardrobeItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(items));
  }, []);

  const persistSaved = useCallback(async (items: Outfit[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(items));
  }, []);

  const setDemoMode = useCallback(async (v: boolean) => {
    setDemoModeState(v);
    await AsyncStorage.setItem(STORAGE_KEYS.DEMO, v ? 'true' : 'false');

    if (!v) {
      try {
        const token = await getAuthToken();
        if (!token) {
          const res = await apiRequest('POST', '/api/auth/guest');
          const data = await res.json();
          await setAuthToken(data.token);
          setIsAuthenticated(true);
        }
        await fetchRemoteData();
      } catch (err) {
        console.warn('Failed to connect to backend:', err);
        setDemoModeState(true);
        await AsyncStorage.setItem(STORAGE_KEYS.DEMO, 'true');
      }
    } else {
      setWardrobeItems(demoWardrobeItems);
      setOutfits(demoOutfits);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEYS.THEME, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const setHasSeenOnboarding = useCallback(async (v: boolean) => {
    setHasSeenOnboardingState(v);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, v ? 'true' : 'false');
  }, []);

  const signInAsGuest = useCallback(async () => {
    setIsGuest(true);
    setDemoModeState(true);
    AsyncStorage.setItem(STORAGE_KEYS.GUEST, 'true');
    AsyncStorage.setItem(STORAGE_KEYS.DEMO, 'true');

    try {
      const res = await apiRequest('POST', '/api/auth/guest');
      const data = await res.json();
      await setAuthToken(data.token);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsGuest(true);
    setDemoModeState(true);
    setHasSeenOnboardingState(false);
    setWardrobeItems(demoWardrobeItems);
    setOutfits(demoOutfits);
    setSavedOutfits([]);
    setIsAuthenticated(false);
    setCredits(100);
    await clearAuthToken();
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  }, []);

  const addWardrobeItem = useCallback(async (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'usageCount' | 'lastWorn'>) => {
    if (!demoMode && isAuthenticated) {
      try {
        const res = await apiRequest('POST', '/api/wardrobe', {
          name: item.name,
          category: item.category,
          color: item.color,
          brand: item.brand,
          notes: item.notes,
          imageUrl: item.imageUrl,
          tags: item.tags,
        });
        const apiItem = await res.json();
        const localItem = mapApiItemToLocal(apiItem);
        setWardrobeItems(prev => {
          const next = [localItem, ...prev];
          persistWardrobe(next);
          return next;
        });
        return;
      } catch (err) {
        console.warn('API add failed, falling back to local:', err);
      }
    }

    const newItem: WardrobeItem = {
      ...item,
      id: Crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastWorn: null,
    };
    setWardrobeItems(prev => {
      const next = [newItem, ...prev];
      persistWardrobe(next);
      return next;
    });
  }, [persistWardrobe, demoMode, isAuthenticated]);

  const removeWardrobeItem = useCallback(async (id: string) => {
    if (!demoMode && isAuthenticated) {
      try {
        await apiRequest('DELETE', `/api/wardrobe/${id}`);
      } catch (err) {
        console.warn('API delete failed:', err);
      }
    }
    setWardrobeItems(prev => {
      const next = prev.filter(i => i.id !== id);
      persistWardrobe(next);
      return next;
    });
  }, [persistWardrobe, demoMode, isAuthenticated]);

  const updateWardrobeItemFn = useCallback(async (id: string, data: Partial<WardrobeItem>) => {
    if (!demoMode && isAuthenticated) {
      try {
        await apiRequest('PUT', `/api/wardrobe/${id}`, data);
      } catch (err) {
        console.warn('API update failed:', err);
      }
    }
    setWardrobeItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...data } : i);
      persistWardrobe(next);
      return next;
    });
  }, [persistWardrobe, demoMode, isAuthenticated]);

  const markItemWorn = useCallback(async (id: string) => {
    if (!demoMode && isAuthenticated) {
      try {
        const res = await apiRequest('POST', `/api/wardrobe/${id}/mark-worn`);
        const updated = await res.json();
        setWardrobeItems(prev => {
          const next = prev.map(i => i.id === id ? mapApiItemToLocal(updated) : i);
          persistWardrobe(next);
          return next;
        });
        return;
      } catch (err) {
        console.warn('API mark-worn failed:', err);
      }
    }
    setWardrobeItems(prev => {
      const next = prev.map(i => i.id === id ? {
        ...i,
        usageCount: (i.usageCount || 0) + 1,
        lastWorn: new Date().toISOString(),
      } : i);
      persistWardrobe(next);
      return next;
    });
  }, [persistWardrobe, demoMode, isAuthenticated]);

  const rateOutfit = useCallback((id: string, rating: 'like' | 'neutral' | 'dislike') => {
    setOutfits(prev => prev.map(o => o.id === id ? { ...o, rating } : o));
    if (!demoMode && isAuthenticated) {
      apiRequest('PUT', `/api/outfits/${id}`, { rating }).catch(() => {});
    }
  }, [demoMode, isAuthenticated]);

  const saveOutfit = useCallback((id: string) => {
    setOutfits(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, saved: true } : o);
      const outfit = updated.find(o => o.id === id);
      if (outfit) {
        setSavedOutfits(s => {
          const next = [...s.filter(so => so.id !== id), outfit];
          persistSaved(next);
          return next;
        });
      }
      return updated;
    });
    if (!demoMode && isAuthenticated) {
      apiRequest('PUT', `/api/outfits/${id}`, { saved: true }).catch(() => {});
    }
  }, [persistSaved, demoMode, isAuthenticated]);

  const unsaveOutfit = useCallback((id: string) => {
    setOutfits(prev => prev.map(o => o.id === id ? { ...o, saved: false } : o));
    setSavedOutfits(prev => {
      const next = prev.filter(o => o.id !== id);
      persistSaved(next);
      return next;
    });
    if (!demoMode && isAuthenticated) {
      apiRequest('PUT', `/api/outfits/${id}`, { saved: false }).catch(() => {});
    }
  }, [persistSaved, demoMode, isAuthenticated]);

  const generateOutfits = useCallback(async (occasion?: string, weather?: string) => {
    if (!demoMode && isAuthenticated) {
      try {
        const body: Record<string, string> = {};
        if (occasion) body.occasion = occasion;
        if (weather) body.weather = weather;
        const res = await apiRequest('POST', '/api/outfits/suggest', body);
        const apiOutfits: any[] = await res.json();
        const localOutfits = apiOutfits.map(o => mapApiOutfitToLocal(o, wardrobeItems));
        if (localOutfits.length > 0) {
          setOutfits(localOutfits);
          return;
        }
      } catch (err) {
        console.warn('AI outfit suggestion failed:', err);
      }
    }

    setOutfits(demoOutfits.map(o => ({
      ...o,
      id: Crypto.randomUUID(),
      rating: null,
      saved: false,
    })));
  }, [demoMode, isAuthenticated, wardrobeItems]);

  const getExplanation = useCallback((id: string) => {
    const outfit = outfits.find(o => o.id === id) || savedOutfits.find(o => o.id === id);
    return outfit?.explanation || 'This outfit was curated by our AI based on your style preferences and current trends.';
  }, [outfits, savedOutfits]);

  const generateCaption = useCallback(async (outfitId: string, tone: string = 'casual', platform: string = 'instagram'): Promise<CaptionResult> => {
    if (!demoMode && isAuthenticated) {
      try {
        const createRes = await apiRequest('POST', '/api/content', {
          outfitId,
          tone,
          platform,
        });
        const job = await createRes.json();

        let attempts = 0;
        while (attempts < 15) {
          await new Promise(r => setTimeout(r, 1000));
          const statusRes = await apiRequest('GET', `/api/content/${job.id}`);
          const status = await statusRes.json();
          if (status.status === 'completed') {
            return {
              caption: status.caption || 'Looking great today!',
              hashtags: status.hashtags || ['#OOTD', '#Fashion', '#ClosetAI'],
            };
          }
          if (status.status === 'failed') break;
          attempts++;
        }
      } catch (err) {
        console.warn('Content generation failed:', err);
      }
    }

    const idx = Math.abs(outfitId.charCodeAt(outfitId.length - 1)) % demoCaptions.length;
    return demoCaptions[idx];
  }, [demoMode, isAuthenticated]);

  const createTryOn = useCallback(async (selfieUri: string, garmentIds: string[]): Promise<TryOnResult> => {
    if (!demoMode && isAuthenticated) {
      try {
        let selfieBase64: string | undefined;
        if (Platform.OS !== 'web' && selfieUri.startsWith('file://')) {
          selfieBase64 = await FileSystem.readAsStringAsync(selfieUri, {
            encoding: 'base64' as any,
          });
        } else if (selfieUri.startsWith('data:')) {
          selfieBase64 = selfieUri.split(',')[1];
        } else if (Platform.OS === 'web') {
          try {
            const resp = await fetch(selfieUri);
            const blob = await resp.blob();
            selfieBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
              };
              reader.readAsDataURL(blob);
            });
          } catch {
            selfieBase64 = undefined;
          }
        }

        const createRes = await apiRequest('POST', '/api/tryon', {
          selfieUrl: selfieUri,
          selfieBase64,
          garmentItemIds: garmentIds,
        });
        const job = await createRes.json();

        let attempts = 0;
        while (attempts < 30) {
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await apiRequest('GET', `/api/tryon/${job.id}`);
          const status = await statusRes.json();
          if (status.status === 'completed') {
            return {
              id: status.id,
              selfieUri,
              garmentIds,
              resultImageUrl: status.resultImageUrl || selfieUri,
              status: 'done',
              createdAt: status.createdAt,
            };
          }
          if (status.status === 'failed') break;
          attempts++;
        }
      } catch (err) {
        console.warn('Try-on job failed:', err);
      }
    }

    await new Promise(r => setTimeout(r, 2500));
    return {
      id: Crypto.randomUUID(),
      selfieUri,
      garmentIds,
      resultImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
      status: 'done',
      createdAt: new Date().toISOString(),
    };
  }, [demoMode, isAuthenticated]);

  const getStyleInsight = useCallback(async () => {
    if (!demoMode && isAuthenticated) {
      try {
        const res = await apiRequest('POST', '/api/ai/style-insight');
        return await res.json();
      } catch {
        // fallback
      }
    }
    return {
      insight: 'Your wardrobe has great versatility across casual and formal occasions!',
      dominantStyle: 'Smart Casual',
      suggestion: 'Consider adding a statement accessory to elevate your looks.',
    };
  }, [demoMode, isAuthenticated]);

  const upgradeTier = useCallback(async (tier: string) => {
    const tierConfig: Record<string, number> = { free: 25, pro: 1000, enterprise: 100000 };
    if (!demoMode && isAuthenticated) {
      try {
        const res = await apiRequest('POST', '/api/subscription/upgrade', { tier });
        const sub = await res.json();
        setSubscriptionTier(sub.tier);
        setCreditsUsed(sub.creditsUsed || 0);
        setMonthlyCredits(sub.monthlyCredits || tierConfig[tier] || 25);
        return;
      } catch (err) {
        console.warn('Upgrade failed:', err);
      }
    }
    setSubscriptionTier(tier);
    setCreditsUsed(0);
    setMonthlyCredits(tierConfig[tier] || 25);
  }, [demoMode, isAuthenticated]);

  const canUseCredit = useCallback(() => {
    return creditsUsed < monthlyCredits;
  }, [creditsUsed, monthlyCredits]);

  const trackAffiliate = useCallback(async (productName: string, productUrl: string, source: string) => {
    if (!demoMode && isAuthenticated) {
      try {
        await apiRequest('POST', '/api/affiliate/click', { productName, productUrl, source });
      } catch { /* silent */ }
    }
  }, [demoMode, isAuthenticated]);

  const refreshWardrobe = useCallback(async () => {
    if (!demoMode && isAuthenticated) {
      try {
        const res = await apiRequest('GET', '/api/wardrobe');
        const apiItems: any[] = await res.json();
        const localItems = apiItems.map(mapApiItemToLocal);
        setWardrobeItems(localItems.length > 0 ? localItems : demoWardrobeItems);
        return;
      } catch {
        // fall through to local
      }
    }
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.WARDROBE);
    if (stored) {
      setWardrobeItems(JSON.parse(stored));
    }
  }, [demoMode, isAuthenticated]);

  const value = useMemo((): AppContextValue => ({
    isGuest,
    demoMode,
    isDark,
    hasSeenOnboarding,
    wardrobeItems,
    outfits,
    savedOutfits,
    isLoading,
    credits,
    isAuthenticated,
    subscriptionTier,
    creditsUsed,
    monthlyCredits,
    setDemoMode,
    toggleTheme,
    setHasSeenOnboarding,
    signInAsGuest,
    signOut,
    addWardrobeItem,
    removeWardrobeItem,
    updateWardrobeItem: updateWardrobeItemFn,
    markItemWorn,
    rateOutfit,
    saveOutfit,
    unsaveOutfit,
    generateOutfits,
    getExplanation,
    generateCaption,
    createTryOn,
    refreshWardrobe,
    getStyleInsight,
    upgradeTier,
    canUseCredit,
    trackAffiliate,
  }), [
    isGuest, demoMode, isDark, hasSeenOnboarding, wardrobeItems, outfits, savedOutfits, isLoading,
    credits, isAuthenticated, subscriptionTier, creditsUsed, monthlyCredits,
    setDemoMode, toggleTheme, setHasSeenOnboarding, signInAsGuest, signOut,
    addWardrobeItem, removeWardrobeItem, updateWardrobeItemFn, markItemWorn, rateOutfit, saveOutfit, unsaveOutfit,
    generateOutfits, getExplanation, generateCaption, createTryOn, refreshWardrobe, getStyleInsight,
    upgradeTier, canUseCredit, trackAffiliate,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
