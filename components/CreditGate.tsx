import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';

interface CreditGateProps {
  action: string;
  onAllowed: () => void;
}

export function CreditGateButton({ action, onAllowed }: CreditGateProps) {
  const { canUseCredit, subscriptionTier, creditsUsed, monthlyCredits } = useApp();
  const { colors } = useTheme();

  const remaining = monthlyCredits - creditsUsed;
  const isAllowed = canUseCredit();

  if (!isAllowed) {
    return (
      <Pressable
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.push('/subscription');
        }}
        style={styles.upgradeWrap}
      >
        <LinearGradient
          colors={['#6E4AE0', '#9B6DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeBtn}
        >
          <Ionicons name="lock-closed" size={16} color="#FFF" />
          <Text style={styles.upgradeText}>Upgrade to Continue</Text>
        </LinearGradient>
        <Text style={[styles.limitText, { color: colors.textSecondary }]}>
          {remaining}/{monthlyCredits} credits remaining
        </Text>
      </Pressable>
    );
  }

  return null;
}

export function useCheckCredit() {
  const { canUseCredit } = useApp();

  return {
    isAllowed: canUseCredit(),
    gate: () => {
      if (!canUseCredit()) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.push('/subscription');
        return false;
      }
      return true;
    },
  };
}

export function CreditBanner() {
  const { subscriptionTier, creditsUsed, monthlyCredits } = useApp();
  const { colors, isDark } = useTheme();

  const remaining = monthlyCredits - creditsUsed;
  const pct = monthlyCredits > 0 ? (creditsUsed / monthlyCredits) * 100 : 0;
  const isLow = pct >= 80;

  if (subscriptionTier !== 'free') return null;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/subscription');
      }}
    >
      <LinearGradient
        colors={isLow ? ['rgba(231,76,60,0.12)', 'rgba(231,76,60,0.04)'] : ['rgba(110,74,224,0.12)', 'rgba(110,74,224,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerWrap}
      >
        <View style={styles.bannerLeft}>
          <Ionicons name={isLow ? 'warning' : 'flash'} size={18} color={isLow ? '#E74C3C' : colors.violet} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              {isLow ? 'Credits Running Low' : 'Free Plan'}
            </Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              {remaining} of {monthlyCredits} credits left
            </Text>
          </View>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(pct, 100)}%` as any,
                backgroundColor: isLow ? '#E74C3C' : colors.violet,
              },
            ]}
          />
        </View>
        <View style={styles.bannerAction}>
          <Text style={[styles.bannerActionText, { color: colors.violet }]}>Upgrade</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.violet} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  upgradeWrap: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  upgradeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
  limitText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
  },
  bannerWrap: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
  },
  bannerSub: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    marginTop: 1,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bannerActionText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
});
