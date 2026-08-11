import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInRight, FadeIn, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { gradients, shadows } from '@/constants/colors';
import { CreditBanner } from '@/components/CreditGate';

const SCREEN_WIDTH = Dimensions.get('window').width;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStyleTip(): string {
  const tips = [
    'Layer neutral tones for an effortless look',
    'A statement piece can transform any outfit',
    'Mix textures for added visual interest',
    'Accessorize to elevate your basics',
    'Monochrome outfits always make an impact',
  ];
  const idx = new Date().getDate() % tips.length;
  return tips[idx];
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    wardrobeItems, outfits, savedOutfits, demoMode,
    hasSeenOnboarding, isLoading, credits, getStyleInsight,
  } = useApp();

  const [styleInsight, setStyleInsight] = useState<{
    insight: string;
    dominantStyle: string;
    suggestion: string;
  } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    if (!isLoading && !hasSeenOnboarding) {
      router.replace('/onboarding');
    }
  }, [isLoading, hasSeenOnboarding]);

  const loadInsight = useCallback(async () => {
    if (wardrobeItems.length < 3) return;
    setInsightLoading(true);
    try {
      const result = await getStyleInsight();
      setStyleInsight(result);
    } catch {
    } finally {
      setInsightLoading(false);
    }
  }, [getStyleInsight, wardrobeItems.length]);

  useEffect(() => {
    if (wardrobeItems.length >= 3 && !styleInsight && !insightLoading) {
      loadInsight();
    }
  }, [wardrobeItems.length]);

  const totalItems = wardrobeItems.length;
  const wornItems = wardrobeItems.filter(i => (i.usageCount || 0) > 0).length;
  const utilizationPct = totalItems > 0 ? Math.round((wornItems / totalItems) * 100) : 0;
  const categoryCounts: Record<string, number> = {};
  wardrobeItems.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const todayOutfit = outfits[0];
  const topScoredOutfit = [...outfits].sort((a, b) => (b.score || 0) - (a.score || 0))[0];

  const quickActions = [
    { icon: 'add-circle-outline' as const, label: 'Add Item', desc: 'Snap & organize', route: '/add-item', gradient: ['#C17F59', '#D4A574'] as [string, string] },
    { icon: 'sparkles-outline' as const, label: 'Get Outfits', desc: 'AI suggestions', route: '/(tabs)/outfits', gradient: ['#6E4AE0', '#9B6DFF'] as [string, string] },
    { icon: 'person-outline' as const, label: 'Try-On', desc: 'Virtual fitting', route: '/(tabs)/tryon', gradient: ['#EC4899', '#F472B6'] as [string, string] },
    { icon: 'share-social-outline' as const, label: 'Studio', desc: 'Content creator', route: '/(tabs)/content', gradient: ['#00C9B7', '#00E5D0'] as [string, string] },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={isDark ? ['#1A1612', '#0D0D0D'] : ['#F0E6DB', '#FAF7F2']}
          style={[styles.heroSection, { paddingTop: (insets.top || webTopInset) + 16 }]}
        >
          <Animated.View entering={FadeInUp.duration(500)} style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
              <Text style={[styles.title, { color: colors.text }]}>CLOSET A.I.</Text>
            </View>
            <View style={styles.headerRight}>
              {credits !== undefined && (
                <Animated.View entering={ZoomIn.delay(200).duration(400)}>
                  <LinearGradient
                    colors={isDark ? ['rgba(212,165,116,0.2)', 'rgba(212,165,116,0.08)'] : ['rgba(193,127,89,0.12)', 'rgba(193,127,89,0.04)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.creditBadge}
                  >
                    <Ionicons name="flash" size={13} color={colors.tint} />
                    <Text style={[styles.creditCount, { color: colors.tint }]}>{credits}</Text>
                  </LinearGradient>
                </Animated.View>
              )}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/settings');
                }}
                hitSlop={12}
                style={[styles.settingsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              >
                <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Animated.View>

          {demoMode && (
            <Animated.View
              entering={FadeInUp.delay(100).duration(400)}
              style={[styles.demoBanner, { borderColor: colors.tint + '30' }]}
            >
              <LinearGradient
                colors={[colors.tint + '15', colors.tint + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.demoBannerGradient}
              >
                <Ionicons name="flask-outline" size={14} color={colors.tint} />
                <Text style={[styles.demoText, { color: colors.tint }]}>Demo Mode</Text>
              </LinearGradient>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.statsRow}>
            {[
              { icon: 'shirt-outline' as const, value: totalItems, label: 'Items', color: '#C17F59', gradient: ['#C17F59', '#D4A574'] as const },
              { icon: 'sparkles-outline' as const, value: outfits.length, label: 'Outfits', color: '#6E4AE0', gradient: ['#6E4AE0', '#9B6DFF'] as const },
              { icon: 'bookmark-outline' as const, value: savedOutfits.length, label: 'Saved', color: '#EC4899', gradient: ['#EC4899', '#F472B6'] as const },
            ].map((stat, idx) => (
              <Animated.View key={stat.label} entering={FadeInUp.delay(200 + idx * 80).duration(400)}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (idx === 0) router.push('/(tabs)/wardrobe');
                    else if (idx === 1) router.push('/(tabs)/outfits');
                  }}
                  style={({ pressed }) => [
                    styles.statCard,
                    { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.96 : 1 }] },
                    shadows.soft,
                  ]}
                >
                  <LinearGradient
                    colors={stat.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statIconWrap}
                  >
                    <Ionicons name={stat.icon} size={16} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.statNumber, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </Animated.View>
        </LinearGradient>

        <View style={styles.mainContent}>
          <Animated.View entering={FadeInUp.delay(150).duration(400)}>
            <LinearGradient
              colors={isDark ? ['rgba(212,165,116,0.08)', 'rgba(212,165,116,0.02)'] : ['rgba(193,127,89,0.06)', 'rgba(193,127,89,0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.tipCard, { borderColor: colors.tint + '12' }]}
            >
              <View style={[styles.tipIcon, { backgroundColor: colors.tint + '15' }]}>
                <MaterialCommunityIcons name="lightbulb-outline" size={16} color={colors.tint} />
              </View>
              <Text style={[styles.tipText, { color: colors.text }]}>{getStyleTip()}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(220).duration(450)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/skin');
              }}
              style={({ pressed }) => [
                styles.skinCard,
                { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] },
                shadows.medium,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open Skin Care"
            >
              <LinearGradient
                colors={isDark ? ['#39251F', '#201713'] : ['#F4D9C7', '#FFF7F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.skinCardGradient}
              >
                <View style={styles.skinCardIcon}>
                  <Ionicons name="sparkles" size={20} color="#A85F48" />
                </View>
                <View style={styles.skinCardCopy}>
                  <Text style={[styles.skinCardEyebrow, { color: colors.tint }]}>NEW • SKIN AI</Text>
                  <Text style={[styles.skinCardTitle, { color: colors.text }]}>Style your whole look</Text>
                  <Text style={[styles.skinCardText, { color: colors.textSecondary }]}>
                    Scan your skin, get a gentle routine, then turn the insight into outfit inspiration.
                  </Text>
                </View>
                <View style={[styles.skinCardArrow, { backgroundColor: colors.surface + 'B8' }]}>
                  <Ionicons name="arrow-forward" size={17} color={colors.tint} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {styleInsight && (
            <Animated.View entering={FadeIn.delay(300).duration(400)}>
              <View style={[styles.insightCard, { backgroundColor: colors.surface }, shadows.medium]}>
                <LinearGradient
                  colors={isDark ? ['rgba(110,74,224,0.12)', 'rgba(110,74,224,0.02)'] : ['rgba(110,74,224,0.06)', 'rgba(110,74,224,0.01)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.insightGradient}
                >
                  <View style={styles.insightHeader}>
                    <LinearGradient
                      colors={['#6E4AE0', '#9B6DFF']}
                      style={styles.insightIconWrap}
                    >
                      <MaterialCommunityIcons name="brain" size={14} color="#FFF" />
                    </LinearGradient>
                    <Text style={[styles.insightTitle, { color: colors.text }]}>Style Insight</Text>
                    <View style={[styles.insightBadge, { backgroundColor: '#6E4AE012' }]}>
                      <Text style={[styles.insightBadgeText, { color: '#6E4AE0' }]}>{styleInsight.dominantStyle}</Text>
                    </View>
                  </View>
                  <Text style={[styles.insightText, { color: colors.textSecondary }]}>{styleInsight.insight}</Text>
                  <View style={[styles.insightSuggestion, { backgroundColor: isDark ? 'rgba(110,74,224,0.08)' : 'rgba(110,74,224,0.04)' }]}>
                    <Ionicons name="bulb-outline" size={14} color="#6E4AE0" />
                    <Text style={[styles.insightSuggestionText, { color: colors.text }]}>{styleInsight.suggestion}</Text>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          )}

          {todayOutfit && (
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Pick</Text>
                {topScoredOutfit && topScoredOutfit.score > 0 && (
                  <View style={[styles.scoreMini, { backgroundColor: '#27AE6015' }]}>
                    <View style={[styles.scoreDot, { backgroundColor: '#27AE60' }]} />
                    <Text style={[styles.scoreText, { color: '#27AE60' }]}>{Math.round(topScoredOutfit.score * 100)}%</Text>
                  </View>
                )}
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/outfit-detail', params: { id: todayOutfit.id } });
                }}
                style={({ pressed }) => [
                  styles.outfitCard,
                  { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] },
                  shadows.medium,
                ]}
              >
                <View style={styles.outfitImages}>
                  {todayOutfit.items.slice(0, 3).map((item, idx) => (
                    <Image
                      key={item.id}
                      source={{ uri: item.imageUrl }}
                      style={[
                        styles.outfitItemImage,
                        { marginLeft: idx > 0 ? -18 : 0, zIndex: 3 - idx, borderColor: colors.surface },
                      ]}
                      contentFit="cover"
                      transition={300}
                    />
                  ))}
                </View>
                <View style={styles.outfitInfo}>
                  <Text style={[styles.outfitName, { color: colors.text }]}>{todayOutfit.name}</Text>
                  <Text style={[styles.outfitReason, { color: colors.textSecondary }]} numberOfLines={2}>{todayOutfit.reason}</Text>
                  <View style={styles.outfitMeta}>
                    {todayOutfit.occasion && (
                      <View style={[styles.outfitOccasion, { backgroundColor: colors.tint + '12' }]}>
                        <Text style={[styles.outfitOccasionText, { color: colors.tint }]}>{todayOutfit.occasion}</Text>
                      </View>
                    )}
                    <View style={[styles.aiMark, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                      <MaterialCommunityIcons name="auto-fix" size={10} color={colors.textSecondary} />
                      <Text style={[styles.aiMarkText, { color: colors.textSecondary }]}>AI</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.outfitArrow, { backgroundColor: colors.tint + '12' }]}>
                  <Ionicons name="chevron-forward" size={16} color={colors.tint} />
                </View>
              </Pressable>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, idx) => (
                <Animated.View key={action.label} entering={FadeInRight.delay(400 + idx * 80).duration(400)}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(action.route as any);
                    }}
                    style={({ pressed }) => [
                      styles.actionCard,
                      { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.96 : 1 }] },
                      shadows.soft,
                    ]}
                  >
                    <LinearGradient
                      colors={action.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionIconGradient}
                    >
                      <Ionicons name={action.icon} size={20} color="#FFF" />
                    </LinearGradient>
                    <View>
                      <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                      <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{action.desc}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(450).duration(400)}>
            <CreditBanner />
          </Animated.View>

          {topCategory && totalItems > 0 && (
            <Animated.View entering={FadeIn.delay(500).duration(400)}>
              <View style={[styles.wardrobeGlance, { backgroundColor: colors.surface }, shadows.medium]}>
                <LinearGradient
                  colors={isDark ? ['rgba(0,201,183,0.08)', 'transparent'] : ['rgba(0,201,183,0.04)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.glanceInner}
                >
                  <View style={styles.glanceHeader}>
                    <LinearGradient
                      colors={['#00C9B7', '#00E5D0']}
                      style={styles.glanceIconWrap}
                    >
                      <Ionicons name="analytics-outline" size={14} color="#FFF" />
                    </LinearGradient>
                    <Text style={[styles.glanceTitle, { color: colors.text }]}>Wardrobe Glance</Text>
                  </View>
                  <View style={styles.glanceRow}>
                    <View style={styles.glanceStat}>
                      <Text style={[styles.glanceValue, { color: colors.tint }]}>{totalItems}</Text>
                      <Text style={[styles.glanceLabel, { color: colors.textSecondary }]}>Pieces</Text>
                    </View>
                    <View style={[styles.glanceDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.glanceStat}>
                      <Text style={[styles.glanceValue, { color: '#00C9B7' }]}>{utilizationPct}%</Text>
                      <Text style={[styles.glanceLabel, { color: colors.textSecondary }]}>Worn</Text>
                    </View>
                    <View style={[styles.glanceDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.glanceStat}>
                      <Text style={[styles.glanceValue, { color: '#6E4AE0' }]}>{Object.keys(categoryCounts).length}</Text>
                      <Text style={[styles.glanceLabel, { color: colors.textSecondary }]}>Types</Text>
                    </View>
                    <View style={[styles.glanceDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.glanceStat}>
                      <Text style={[styles.glanceValue, { color: '#EC4899' }]}>{topCategory[0]}</Text>
                      <Text style={[styles.glanceLabel, { color: colors.textSecondary }]}>Top</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {},
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  creditCount: { fontFamily: 'Outfit_700Bold', fontSize: 14 },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontFamily: 'Outfit_400Regular', fontSize: 14, marginBottom: 2 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, letterSpacing: 1 },
  demoBanner: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  demoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  demoText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 3,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  statLabel: { fontFamily: 'Outfit_400Regular', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { fontFamily: 'Outfit_400Regular', fontSize: 13, flex: 1, lineHeight: 18 },
  skinCard: { borderRadius: 22, overflow: 'hidden', marginBottom: 22 },
  skinCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  skinCardIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center' },
  skinCardCopy: { flex: 1, gap: 3 },
  skinCardEyebrow: { fontFamily: 'Outfit_700Bold', fontSize: 10, letterSpacing: 1.1 },
  skinCardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 17 },
  skinCardText: { fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 17 },
  skinCardArrow: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  insightCard: {
    borderRadius: 20,
    marginBottom: 22,
    overflow: 'hidden',
  },
  insightGradient: {
    padding: 16,
    gap: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, flex: 1 },
  insightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  insightBadgeText: { fontFamily: 'Outfit_500Medium', fontSize: 11 },
  insightText: { fontFamily: 'Outfit_400Regular', fontSize: 13, lineHeight: 20 },
  insightSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  insightSuggestionText: { fontFamily: 'Outfit_400Regular', fontSize: 12, flex: 1, lineHeight: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, marginBottom: 14, letterSpacing: -0.3 },
  scoreMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scoreDot: { width: 6, height: 6, borderRadius: 3 },
  scoreText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  outfitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    marginBottom: 22,
  },
  outfitImages: { flexDirection: 'row', marginRight: 12 },
  outfitItemImage: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2.5,
  },
  outfitInfo: { flex: 1 },
  outfitName: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, marginBottom: 3 },
  outfitReason: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginBottom: 6, lineHeight: 16 },
  outfitMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outfitOccasion: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  outfitOccasionText: { fontFamily: 'Outfit_500Medium', fontSize: 10 },
  aiMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiMarkText: { fontFamily: 'Outfit_500Medium', fontSize: 9 },
  outfitArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  actionIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  actionDesc: { fontFamily: 'Outfit_400Regular', fontSize: 11, marginTop: 1 },
  wardrobeGlance: {
    borderRadius: 20,
    marginTop: 22,
    overflow: 'hidden',
  },
  glanceInner: {
    padding: 18,
  },
  glanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  glanceIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glanceTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  glanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glanceStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  glanceValue: { fontFamily: 'Outfit_700Bold', fontSize: 22 },
  glanceLabel: { fontFamily: 'Outfit_400Regular', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  glanceDivider: { width: 1, height: 32 },
});
