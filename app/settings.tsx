import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { shadows } from '@/constants/colors';

function SettingsRow({
  icon,
  label,
  trailing,
  onPress,
  colors,
  destructive,
  isDark,
}: {
  icon: string;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  colors: any;
  destructive?: boolean;
  isDark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        { backgroundColor: colors.surface, transform: [{ scale: pressed && onPress ? 0.98 : 1 }] },
        shadows.soft,
      ]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: destructive ? '#E74C3C12' : colors.tint + '12' }]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={destructive ? '#E74C3C' : colors.tint}
        />
      </View>
      <Text style={[styles.settingsLabel, { color: destructive ? '#E74C3C' : colors.text }]}>
        {label}
      </Text>
      {trailing}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { demoMode, toggleTheme, setDemoMode, signOut, wardrobeItems, credits, isAuthenticated, subscriptionTier, creditsUsed, monthlyCredits } = useApp();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'This will reset all your data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            signOut();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || webBottomInset) + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)}>
          <LinearGradient
            colors={isDark ? ['rgba(212,165,116,0.12)', 'rgba(212,165,116,0.04)'] : ['rgba(193,127,89,0.1)', 'rgba(193,127,89,0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <LinearGradient
              colors={['#C17F59', '#D4A574']}
              style={styles.avatar}
            >
              <Ionicons name="person" size={26} color="#FFF" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.text }]}>Guest User</Text>
              <Text style={[styles.profileSub, { color: colors.textSecondary }]}>
                {wardrobeItems.length} items in wardrobe
              </Text>
            </View>
            {credits !== undefined && (
              <View style={[styles.profileCredits, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                <Ionicons name="flash" size={12} color={colors.tint} />
                <Text style={[styles.profileCreditsText, { color: colors.tint }]}>{credits}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            colors={colors}
            isDark={isDark}
            trailing={
              <Switch
                value={isDark}
                onValueChange={() => {
                  Haptics.selectionAsync();
                  toggleTheme();
                }}
                trackColor={{ true: colors.tint, false: colors.border }}
              />
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Subscription</Text>
          <SettingsRow
            icon="diamond-outline"
            label={`${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan`}
            colors={colors}
            isDark={isDark}
            onPress={() => router.push('/subscription')}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.creditsBadge, { backgroundColor: colors.violet + '18' }]}>
                  <Text style={[styles.creditsText, { color: colors.violet }]}>{subscriptionTier === 'free' ? 'FREE' : subscriptionTier.toUpperCase()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            }
          />
          <SettingsRow
            icon="flash-outline"
            label="AI Credits"
            colors={colors}
            isDark={isDark}
            onPress={() => router.push('/subscription')}
            trailing={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.creditsBadge, { backgroundColor: colors.tint + '12' }]}>
                  <Text style={[styles.creditsText, { color: colors.tint }]}>{monthlyCredits - creditsUsed}/{monthlyCredits}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            }
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>App</Text>
          <SettingsRow
            icon="flask-outline"
            label="Demo Mode"
            colors={colors}
            isDark={isDark}
            trailing={
              <Switch
                value={demoMode}
                onValueChange={(v) => {
                  Haptics.selectionAsync();
                  setDemoMode(v);
                }}
                trackColor={{ true: colors.tint, false: colors.border }}
              />
            }
          />
          <SettingsRow
            icon="bar-chart-outline"
            label="Business Dashboard"
            colors={colors}
            isDark={isDark}
            onPress={() => router.push('/business-dashboard')}
            trailing={<Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
          />
          {isAuthenticated && (
            <SettingsRow
              icon="cloud-done-outline"
              label="Connected to Cloud"
              colors={colors}
              isDark={isDark}
              trailing={
                <View style={[styles.connectionDot, { backgroundColor: '#27AE60' }]} />
              }
            />
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <SettingsRow
            icon="information-circle-outline"
            label="Version 1.0.0"
            colors={colors}
            isDark={isDark}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)} style={{ marginTop: 12 }}>
          <SettingsRow
            icon="log-out-outline"
            label="Sign Out & Reset"
            colors={colors}
            isDark={isDark}
            destructive
            onPress={handleSignOut}
          />
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
  scrollContent: { paddingHorizontal: 20, gap: 8 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: { fontFamily: 'Outfit_600SemiBold', fontSize: 18 },
  profileSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 2 },
  profileCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  profileCreditsText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  sectionTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 6,
  },
  settingsIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: { fontFamily: 'Outfit_500Medium', fontSize: 15, flex: 1 },
  creditsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditsText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
