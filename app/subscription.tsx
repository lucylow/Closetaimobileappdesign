import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, SUBSCRIPTION_TIERS } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { shadows } from '@/constants/colors';

function TierCard({
  tier,
  isActive,
  index,
  colors,
  isDark,
  onUpgrade,
}: {
  tier: (typeof SUBSCRIPTION_TIERS)[number];
  isActive: boolean;
  index: number;
  colors: any;
  isDark: boolean;
  onUpgrade: () => void;
}) {
  const isPro = tier.id === 'pro';
  const isEnterprise = tier.id === 'enterprise';

  const cardBackground = isDark
    ? isPro
      ? ['rgba(110,74,224,0.15)', 'rgba(110,74,224,0.05)']
      : isEnterprise
        ? ['rgba(212,165,116,0.12)', 'rgba(193,127,89,0.04)']
        : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']
    : isPro
      ? ['rgba(110,74,224,0.08)', 'rgba(110,74,224,0.02)']
      : isEnterprise
        ? ['rgba(193,127,89,0.08)', 'rgba(193,127,89,0.02)']
        : ['rgba(255,255,255,0.9)', 'rgba(245,240,235,0.9)'];

  const borderColor = isPro
    ? '#6E4AE0'
    : isEnterprise
      ? '#C17F59'
      : isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.06)';

  const priceColor = isPro
    ? '#6E4AE0'
    : isEnterprise
      ? '#C17F59'
      : colors.text;

  const checkColor = isPro
    ? '#6E4AE0'
    : isEnterprise
      ? '#C17F59'
      : '#00C9B7';

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 100).duration(500)}>
      <View
        style={[
          styles.tierCard,
          {
            borderColor,
            borderWidth: isPro ? 2 : 1,
          },
          isPro && shadows.elevated,
          !isPro && shadows.soft,
        ]}
      >
        <LinearGradient
          colors={cardBackground as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tierCardInner}
        >
          {isPro && (
            <LinearGradient
              colors={['#6E4AE0', '#9B6DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.popularBadge}
            >
              <Ionicons name="star" size={10} color="#FFF" />
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </LinearGradient>
          )}

          {isEnterprise && (
            <View style={styles.enterpriseBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#C17F59" />
              <Text style={[styles.enterpriseBadgeText, { color: '#C17F59' }]}>PREMIUM</Text>
            </View>
          )}

          <View style={styles.tierHeader}>
            <View style={styles.tierNameRow}>
              <Ionicons
                name={
                  tier.id === 'free'
                    ? 'leaf-outline'
                    : tier.id === 'pro'
                      ? 'diamond-outline'
                      : 'rocket-outline'
                }
                size={22}
                color={priceColor}
              />
              <Text style={[styles.tierName, { color: colors.text }]}>{tier.name}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceSymbol, { color: priceColor }]}>$</Text>
              <Text style={[styles.priceAmount, { color: priceColor }]}>
                {tier.price === 0 ? '0' : tier.price % 1 === 0 ? tier.price.toString() : tier.price.toFixed(2)}
              </Text>
              <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/mo</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          <View style={styles.featuresList}>
            {tier.features.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureCheck, { backgroundColor: checkColor + '18' }]}>
                  <Ionicons name="checkmark" size={14} color={checkColor} />
                </View>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
              </View>
            ))}
          </View>

          {isActive ? (
            <View style={[styles.currentPlanBadge, { backgroundColor: isDark ? 'rgba(0,201,183,0.12)' : 'rgba(0,201,183,0.08)' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#00C9B7" />
              <Text style={styles.currentPlanText}>Current Plan</Text>
            </View>
          ) : (
            <Pressable
              onPress={onUpgrade}
              style={({ pressed }) => [
                styles.upgradeButton,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              {isPro ? (
                <LinearGradient
                  colors={['#6E4AE0', '#9B6DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeButtonGradient}
                >
                  <Ionicons name="arrow-up-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                </LinearGradient>
              ) : isEnterprise ? (
                <LinearGradient
                  colors={['#C17F59', '#D4A574']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeButtonGradient}
                >
                  <Ionicons name="arrow-up-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.upgradeButtonText}>Contact Sales</Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.upgradeButtonGradient,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text style={[styles.selectButtonText, { color: colors.textSecondary }]}>Select Free</Text>
                </View>
              )}
            </Pressable>
          )}
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

export default function SubscriptionScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { subscriptionTier, creditsUsed, monthlyCredits, upgradeTier } = useApp();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const usagePercent = monthlyCredits > 0 ? Math.min(creditsUsed / monthlyCredits, 1) : 0;

  const currentTierData = SUBSCRIPTION_TIERS.find((t) => t.id === subscriptionTier);

  const handleUpgrade = async (tierId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await upgradeTier(tierId);
      const tierName = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)?.name || tierId;
      Alert.alert('Plan Updated', `You have been upgraded to the ${tierName} plan.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update plan. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Your Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <LinearGradient
            colors={
              isDark
                ? ['rgba(212,165,116,0.12)', 'rgba(212,165,116,0.04)']
                : ['rgba(193,127,89,0.1)', 'rgba(193,127,89,0.02)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusLeft}>
                <LinearGradient
                  colors={['#C17F59', '#D4A574']}
                  style={styles.statusIcon}
                >
                  <Ionicons name="diamond" size={18} color="#FFF" />
                </LinearGradient>
                <View>
                  <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Current Plan</Text>
                  <Text style={[styles.statusTier, { color: colors.text }]}>
                    {currentTierData?.name || 'Free'}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isDark ? 'rgba(0,201,183,0.12)' : 'rgba(0,201,183,0.08)' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#00C9B7" />
                <Text style={styles.statusBadgeText}>Active</Text>
              </View>
            </View>

            <View style={styles.usageSection}>
              <View style={styles.usageLabelRow}>
                <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Credits Used</Text>
                <Text style={[styles.usageCount, { color: colors.text }]}>
                  {creditsUsed} / {monthlyCredits.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.usageBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                <LinearGradient
                  colors={usagePercent > 0.8 ? ['#E74C3C', '#F28B82'] : ['#00C9B7', '#00E5D0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.usageBarFill, { width: `${Math.max(usagePercent * 100, 2)}%` as any }]}
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {SUBSCRIPTION_TIERS.map((tier, index) => (
          <TierCard
            key={tier.id}
            tier={tier}
            isActive={subscriptionTier === tier.id}
            index={index}
            colors={colors}
            isDark={isDark}
            onUpgrade={() => handleUpgrade(tier.id)}
          />
        ))}

        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Cancel anytime. All plans include a 7-day free trial.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
  scrollContent: { paddingHorizontal: 20, gap: 14 },
  statusCard: {
    borderRadius: 20,
    padding: 18,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
  },
  statusTier: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#00C9B7',
  },
  usageSection: {
    gap: 8,
  },
  usageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
  },
  usageCount: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
  },
  usageBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tierCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  tierCardInner: {
    padding: 20,
    gap: 14,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 0.8,
  },
  enterpriseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(193,127,89,0.1)',
  },
  enterpriseBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  tierHeader: {
    gap: 6,
  },
  tierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierName: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 18,
    marginRight: 1,
  },
  priceAmount: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 36,
  },
  pricePeriod: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    opacity: 0.3,
  },
  featuresList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    flex: 1,
  },
  currentPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  currentPlanText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#00C9B7',
  },
  upgradeButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  upgradeButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
  selectButtonText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: {
    fontFamily: 'Outfit_300Light',
    fontSize: 12,
  },
});
