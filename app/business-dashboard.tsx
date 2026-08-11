import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { shadows, gradients } from '@/constants/colors';
import { apiRequest } from '@/lib/query-client';

interface AnalyticsData {
  subscription: { tier: string; creditsUsed: number; monthlyCredits: number };
  wardrobe: { total: number; worn: number; utilizationPct: number };
  outfits: { total: number; saved: number };
  usage: { totalTryOns: number; avgPerItem: number };
  categories: Record<string, number>;
}

const DEMO_ANALYTICS: AnalyticsData = {
  subscription: { tier: 'free', creditsUsed: 12, monthlyCredits: 25 },
  wardrobe: { total: 24, worn: 18, utilizationPct: 75 },
  outfits: { total: 47, saved: 12 },
  usage: { totalTryOns: 38, avgPerItem: 1.6 },
  categories: { tops: 8, bottoms: 6, dresses: 4, outerwear: 3, shoes: 2, accessories: 1 },
};

const TIER_COLORS: Record<string, readonly [string, string]> = {
  free: ['#6E4AE0', '#9B6DFF'],
  pro: ['#C17F59', '#D4A574'],
  enterprise: ['#00C9B7', '#00E5D0'],
};

const TIER_MRR: Record<string, string> = { free: '$0', pro: '$9.99', enterprise: '$499' };
const TIER_LTV: Record<string, string> = { free: '$0', pro: '$119.88', enterprise: '$5,988' };

const BAR_COLORS = ['#00C9B7', '#6E4AE0', '#C17F59', '#D4A574', '#9B6DFF', '#00E5D0'];

function MetricCard({
  icon,
  label,
  value,
  sub,
  colors,
  isDark,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  colors: any;
  isDark: boolean;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)} style={styles.metricCardWrapper}>
      <LinearGradient
        colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.9)', 'rgba(245,240,235,0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.metricCard, { borderColor: colors.border }, shadows.soft]}
      >
        <View style={[styles.metricIconWrap, { backgroundColor: colors.tint + '15' }]}>
          <Ionicons name={icon as any} size={18} color={colors.tint} />
        </View>
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
        {sub ? <Text style={[styles.metricSub, { color: colors.textTertiary }]}>{sub}</Text> : null}
      </LinearGradient>
    </Animated.View>
  );
}

function StatRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statIcon, { backgroundColor: colors.tint + '12' }]}>
        <Ionicons name={icon as any} size={16} color={colors.tint} />
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export default function BusinessDashboardScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { subscriptionTier, creditsUsed, monthlyCredits, wardrobeItems } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  useEffect(() => {
    let mounted = true;
    async function fetchAnalytics() {
      try {
        const res = await apiRequest('GET', '/api/analytics');
        const data = await res.json();
        if (mounted) setAnalytics(data);
      } catch {
        if (mounted) {
          setAnalytics({
            ...DEMO_ANALYTICS,
            subscription: { tier: subscriptionTier, creditsUsed, monthlyCredits },
            wardrobe: {
              total: wardrobeItems.length,
              worn: wardrobeItems.filter(i => (i.usageCount || 0) > 0).length,
              utilizationPct: wardrobeItems.length > 0
                ? Math.round((wardrobeItems.filter(i => (i.usageCount || 0) > 0).length / wardrobeItems.length) * 100)
                : 0,
            },
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  const data = analytics || DEMO_ANALYTICS;
  const tier = data.subscription.tier || 'free';
  const tierGradient = TIER_COLORS[tier] || TIER_COLORS.free;

  const catEntries = Object.entries(data.categories);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0);
  const maxCatVal = Math.max(...catEntries.map(([, v]) => v));

  const conversionPct = data.wardrobe.utilizationPct || 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Business Dashboard</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <LinearGradient
            colors={[tierGradient[0], tierGradient[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tierBanner, shadows.medium]}
          >
            <View style={styles.tierBannerContent}>
              <View style={styles.tierBadge}>
                <Ionicons
                  name={tier === 'enterprise' ? 'rocket' : tier === 'pro' ? 'diamond' : 'sparkles'}
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.tierName}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
              </View>
              <Text style={styles.tierSubtitle}>
                {tier === 'enterprise' ? 'Full Platform Access' : tier === 'pro' ? 'Premium Features Active' : 'Starter Plan'}
              </Text>
            </View>
            <View style={styles.tierRight}>
              <Ionicons name="analytics" size={36} color="rgba(255,255,255,0.3)" />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Revenue Metrics</Text>
        </Animated.View>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="trending-up"
            label="MRR"
            value={TIER_MRR[tier] || '$0'}
            sub="Monthly Recurring"
            colors={colors}
            isDark={isDark}
            delay={150}
          />
          <MetricCard
            icon="stats-chart"
            label="LTV"
            value={TIER_LTV[tier] || '$0'}
            sub="Lifetime Value"
            colors={colors}
            isDark={isDark}
            delay={200}
          />
          <MetricCard
            icon="flash"
            label="Credits Used"
            value={`${data.subscription.creditsUsed}/${data.subscription.monthlyCredits}`}
            sub={`${Math.round((data.subscription.creditsUsed / Math.max(data.subscription.monthlyCredits, 1)) * 100)}% consumed`}
            colors={colors}
            isDark={isDark}
            delay={250}
          />
          <MetricCard
            icon="swap-horizontal"
            label="Conversion"
            value={`${conversionPct}%`}
            sub="Wardrobe utilization"
            colors={colors}
            isDark={isDark}
            delay={300}
          />
        </View>

        <Animated.View entering={FadeInUp.delay(350).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Usage Analytics</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.95)', 'rgba(245,240,235,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.analyticsCard, { borderColor: colors.border }, shadows.soft]}
          >
            <View style={styles.analyticsCardHeader}>
              <Ionicons name="shirt-outline" size={18} color={colors.violet} />
              <Text style={[styles.analyticsCardTitle, { color: colors.text }]}>Wardrobe</Text>
            </View>
            <StatRow icon="cube-outline" label="Total Items" value={`${data.wardrobe.total}`} colors={colors} />
            <StatRow icon="checkmark-circle-outline" label="Worn Items" value={`${data.wardrobe.worn}`} colors={colors} />
            <StatRow icon="pie-chart-outline" label="Utilization" value={`${data.wardrobe.utilizationPct}%`} colors={colors} />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(500)}>
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.95)', 'rgba(245,240,235,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.analyticsCard, { borderColor: colors.border }, shadows.soft]}
          >
            <View style={styles.analyticsCardHeader}>
              <Ionicons name="layers-outline" size={18} color={colors.teal} />
              <Text style={[styles.analyticsCardTitle, { color: colors.text }]}>Outfits</Text>
            </View>
            <StatRow icon="grid-outline" label="Total Generated" value={`${data.outfits.total}`} colors={colors} />
            <StatRow icon="bookmark-outline" label="Saved" value={`${data.outfits.saved}`} colors={colors} />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.95)', 'rgba(245,240,235,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.analyticsCard, { borderColor: colors.border }, shadows.soft]}
          >
            <View style={styles.analyticsCardHeader}>
              <Ionicons name="body-outline" size={18} color="#C17F59" />
              <Text style={[styles.analyticsCardTitle, { color: colors.text }]}>Try-On Sessions</Text>
            </View>
            <StatRow icon="camera-outline" label="Total Sessions" value={`${data.usage.totalTryOns}`} colors={colors} />
            <StatRow icon="speedometer-outline" label="Avg per Item" value={`${data.usage.avgPerItem.toFixed(1)}`} colors={colors} />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Category Breakdown</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(500)}>
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.95)', 'rgba(245,240,235,0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.analyticsCard, { borderColor: colors.border }, shadows.soft]}
          >
            {catEntries.map(([cat, count], idx) => {
              const pct = catTotal > 0 ? Math.round((count / catTotal) * 100) : 0;
              const barWidth = maxCatVal > 0 ? (count / maxCatVal) * 100 : 0;
              const barColor = BAR_COLORS[idx % BAR_COLORS.length];
              return (
                <View key={cat} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.barPct, { color: colors.text }]}>{pct}%</Text>
                  <Text style={[styles.barCount, { color: colors.textTertiary }]}>{count}</Text>
                </View>
              );
            })}
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(650).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data Pipeline</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(500)}>
          <LinearGradient
            colors={isDark ? ['rgba(110,74,224,0.12)', 'rgba(0,201,183,0.08)'] : ['rgba(110,74,224,0.08)', 'rgba(0,201,183,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.pipelineCard, { borderColor: colors.border }, shadows.medium]}
          >
            <Text style={[styles.pipelineTitle, { color: colors.text }]}>Consumer Data</Text>
            <View style={styles.pipelineMetrics}>
              <View style={styles.pipelineMetric}>
                <Ionicons name="archive-outline" size={22} color={colors.violet} />
                <Text style={[styles.pipelineMetricVal, { color: colors.text }]}>{data.wardrobe.total}</Text>
                <Text style={[styles.pipelineMetricLabel, { color: colors.textTertiary }]}>items cataloged</Text>
              </View>
              <View style={styles.pipelineMetric}>
                <Ionicons name="color-wand-outline" size={22} color={colors.teal} />
                <Text style={[styles.pipelineMetricVal, { color: colors.text }]}>{data.outfits.total}</Text>
                <Text style={[styles.pipelineMetricLabel, { color: colors.textTertiary }]}>outfits generated</Text>
              </View>
              <View style={styles.pipelineMetric}>
                <Ionicons name="scan-outline" size={22} color="#C17F59" />
                <Text style={[styles.pipelineMetricVal, { color: colors.text }]}>{data.usage.totalTryOns}</Text>
                <Text style={[styles.pipelineMetricLabel, { color: colors.textTertiary }]}>try-on sessions</Text>
              </View>
            </View>

            <View style={styles.arrowFlow}>
              <View style={[styles.arrowLine, { backgroundColor: colors.violet }]} />
              <View style={[styles.arrowHead, { borderLeftColor: colors.violet }]} />
            </View>

            <LinearGradient
              colors={['#6E4AE0', '#00C9B7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.enterpriseBadge}
            >
              <Ionicons name="hardware-chip-outline" size={18} color="#FFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.enterpriseLabel}>Enterprise AI Precision</Text>
                <Text style={styles.enterpriseValue}>
                  {data.wardrobe.total + data.outfits.total + data.usage.totalTryOns} data points processed
                </Text>
              </View>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Outfit_400Regular', fontSize: 14, marginTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
  scrollContent: { paddingHorizontal: 20, gap: 10 },

  tierBanner: {
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierBannerContent: { flex: 1 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tierName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: '#FFF',
  },
  tierSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  tierRight: {
    width: 50,
    alignItems: 'center',
  },

  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 4,
    marginLeft: 4,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCardWrapper: {
    width: '48%',
    flexGrow: 1,
  },
  metricCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
  },
  metricLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  metricSub: {
    fontFamily: 'Outfit_300Light',
    fontSize: 11,
  },

  analyticsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  analyticsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  analyticsCardTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    flex: 1,
  },
  statValue: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 3,
  },
  barLabel: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barPct: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    width: 32,
    textAlign: 'right',
  },
  barCount: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    width: 20,
    textAlign: 'right',
  },

  pipelineCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  pipelineTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  pipelineMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pipelineMetric: {
    alignItems: 'center',
    gap: 4,
  },
  pipelineMetricVal: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
  },
  pipelineMetricLabel: {
    fontFamily: 'Outfit_300Light',
    fontSize: 11,
    textAlign: 'center',
  },
  arrowFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  arrowLine: {
    flex: 1,
    height: 2,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  enterpriseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
  },
  enterpriseLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  enterpriseValue: {
    fontFamily: 'Outfit_300Light',
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
});
