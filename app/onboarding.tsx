import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
  ViewToken,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useApp } from '@/contexts/AppContext';
import { ONBOARDING_SLIDES } from '@/lib/demo-data';
import { useTheme } from '@/lib/useTheme';
import { gradients } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDE_THEMES = [
  {
    bg: ['#1A1A1A', '#2D1F14'] as const,
    accent: '#D4A574',
    accentSoft: 'rgba(212,165,116,0.12)',
    accentGlow: 'rgba(212,165,116,0.25)',
    ring1: 'rgba(212,165,116,0.06)',
    ring2: 'rgba(212,165,116,0.03)',
    iconGradient: ['#C17F59', '#D4A574'] as const,
    tagline: 'DIGITIZE',
  },
  {
    bg: ['#1A1A1A', '#1A1430'] as const,
    accent: '#9B6DFF',
    accentSoft: 'rgba(110,74,224,0.12)',
    accentGlow: 'rgba(155,109,255,0.25)',
    ring1: 'rgba(110,74,224,0.06)',
    ring2: 'rgba(110,74,224,0.03)',
    iconGradient: ['#6E4AE0', '#9B6DFF'] as const,
    tagline: 'CURATE',
  },
  {
    bg: ['#1A1A1A', '#2A1425'] as const,
    accent: '#F472B6',
    accentSoft: 'rgba(236,72,153,0.12)',
    accentGlow: 'rgba(244,114,182,0.25)',
    ring1: 'rgba(236,72,153,0.06)',
    ring2: 'rgba(236,72,153,0.03)',
    iconGradient: ['#EC4899', '#F472B6'] as const,
    tagline: 'VISUALIZE',
  },
  {
    bg: ['#1A1A1A', '#0F2925'] as const,
    accent: '#00E5D0',
    accentSoft: 'rgba(0,201,183,0.12)',
    accentGlow: 'rgba(0,229,208,0.25)',
    ring1: 'rgba(0,201,183,0.06)',
    ring2: 'rgba(0,201,183,0.03)',
    iconGradient: ['#00C9B7', '#00E5D0'] as const,
    tagline: 'INSPIRE',
  },
];

const DECORATIVE_ICONS: { name: string; set: 'ion' | 'mci' }[][] = [
  [
    { name: 'shirt-outline', set: 'ion' },
    { name: 'camera-outline', set: 'ion' },
    { name: 'color-palette-outline', set: 'ion' },
    { name: 'pricetag-outline', set: 'ion' },
    { name: 'grid-outline', set: 'ion' },
    { name: 'layers-outline', set: 'ion' },
  ],
  [
    { name: 'sparkles-outline', set: 'ion' },
    { name: 'sunny-outline', set: 'ion' },
    { name: 'rainy-outline', set: 'ion' },
    { name: 'star-outline', set: 'ion' },
    { name: 'heart-outline', set: 'ion' },
    { name: 'diamond-outline', set: 'ion' },
  ],
  [
    { name: 'body-outline', set: 'ion' },
    { name: 'eye-outline', set: 'ion' },
    { name: 'resize-outline', set: 'ion' },
    { name: 'scan-outline', set: 'ion' },
    { name: 'person-outline', set: 'ion' },
    { name: 'images-outline', set: 'ion' },
  ],
  [
    { name: 'share-social-outline', set: 'ion' },
    { name: 'logo-instagram', set: 'ion' },
    { name: 'chatbubble-outline', set: 'ion' },
    { name: 'text-outline', set: 'ion' },
    { name: 'megaphone-outline', set: 'ion' },
    { name: 'trending-up-outline', set: 'ion' },
  ],
];

const FLOAT_POSITIONS = [
  { top: '12%', left: '8%', size: 18, rotate: '-15deg', opacity: 0.35 },
  { top: '8%', right: '12%', size: 22, rotate: '20deg', opacity: 0.3 },
  { top: '28%', left: '5%', size: 16, rotate: '10deg', opacity: 0.2 },
  { top: '22%', right: '6%', size: 14, rotate: '-25deg', opacity: 0.25 },
  { top: '42%', right: '10%', size: 20, rotate: '15deg', opacity: 0.15 },
  { top: '38%', left: '12%', size: 15, rotate: '-8deg', opacity: 0.2 },
];

function SlideItem({ item, index }: { item: typeof ONBOARDING_SLIDES[0]; index: number }) {
  const theme = SLIDE_THEMES[index % SLIDE_THEMES.length];
  const icons = DECORATIVE_ICONS[index % DECORATIVE_ICONS.length];

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <LinearGradient
        colors={theme.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {icons.map((ic, i) => {
        const pos = FLOAT_POSITIONS[i];
        return (
          <Animated.View
            key={i}
            entering={FadeIn.delay(300 + i * 120).duration(800)}
            style={[
              styles.floatingIcon,
              {
                top: pos.top as any,
                left: (pos as any).left,
                right: (pos as any).right,
                transform: [{ rotate: pos.rotate }],
                opacity: pos.opacity,
              },
            ]}
          >
            <Ionicons name={ic.name as any} size={pos.size} color={theme.accent} />
          </Animated.View>
        );
      })}

      <View style={styles.slideInner}>
        <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.taglineWrap}>
          <View style={[styles.taglineLine, { backgroundColor: theme.accent }]} />
          <Text style={[styles.taglineText, { color: theme.accent }]}>{theme.tagline}</Text>
          <View style={[styles.taglineLine, { backgroundColor: theme.accent }]} />
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(200).duration(600)} style={styles.iconArea}>
          <View style={[styles.outerRing, { borderColor: theme.ring1 }]}>
            <View style={[styles.middleRing, { borderColor: theme.ring2 }]}>
              <LinearGradient
                colors={theme.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Ionicons name={item.iconName as any} size={44} color="#FFF" />
              </LinearGradient>
            </View>
          </View>
          <View style={[styles.glowOrb, { backgroundColor: theme.accentGlow }]} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(600)} style={styles.textArea}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <View style={[styles.titleUnderline, { backgroundColor: theme.accent }]} />
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(500)} style={styles.featurePills}>
          {index === 0 && (
            <>
              <FeaturePill icon="flash-outline" text="Instant Scan" color={theme.accent} />
              <FeaturePill icon="folder-outline" text="Auto-Organize" color={theme.accent} />
            </>
          )}
          {index === 1 && (
            <>
              <FeaturePill icon="cloudy-outline" text="Weather-Aware" color={theme.accent} />
              <FeaturePill icon="calendar-outline" text="Occasion Match" color={theme.accent} />
            </>
          )}
          {index === 2 && (
            <>
              <FeaturePill icon="camera-outline" text="Your Photo" color={theme.accent} />
              <FeaturePill icon="sparkles-outline" text="AI Magic" color={theme.accent} />
            </>
          )}
          {index === 3 && (
            <>
              <FeaturePill icon="logo-instagram" text="Social Ready" color={theme.accent} />
              <FeaturePill icon="text-outline" text="AI Captions" color={theme.accent} />
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

function FeaturePill({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color + '30', backgroundColor: color + '0A' }]}>
      <Ionicons name={icon as any} size={13} color={color} />
      <Text style={[styles.pillText, { color }]}>{text}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { setHasSeenOnboarding, signInAsGuest } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      flatListRef.current?.scrollToIndex({ index: nextIdx });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    signInAsGuest();
    await setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    signInAsGuest();
    await setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;
  const theme = SLIDE_THEMES[currentIndex % SLIDE_THEMES.length];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.bg}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: (insets.top || webTopInset) + 12 }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, { backgroundColor: theme.accent }]} />
          <Text style={styles.brandText}>CLOSET A.I.</Text>
        </View>
        <Pressable onPress={handleSkip} hitSlop={12} style={[styles.skipButton, { borderColor: 'rgba(255,255,255,0.12)' }]}>
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} />}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        style={[styles.footer, { paddingBottom: (insets.bottom || webBottomInset) + 20 }]}
      >
        <View style={styles.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? theme.accent : 'rgba(255,255,255,0.15)',
                  width: i === currentIndex ? 28 : 8,
                  ...(i === currentIndex ? {
                    shadowColor: theme.accent,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                  } : {}),
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            {
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <LinearGradient
            colors={theme.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            {isLast ? (
              <>
                <Text style={styles.nextButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.footerSkipText}>Explore in demo mode</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  brandText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  skipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  slide: {
    flex: 1,
    overflow: 'hidden',
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  slideInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    zIndex: 2,
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  taglineLine: {
    width: 20,
    height: 1,
    opacity: 0.4,
  },
  taglineText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    letterSpacing: 4,
    opacity: 0.6,
  },
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    zIndex: -1,
  },
  textArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  slideTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  titleUnderline: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: 'rgba(255,255,255,0.55)',
    maxWidth: 280,
  },
  featurePills: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    height: 58,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFF',
  },
  footerSkipText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
  },
});
