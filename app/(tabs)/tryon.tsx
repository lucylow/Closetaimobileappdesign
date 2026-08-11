import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { shadows } from '@/constants/colors';

const PROCESSING_STEPS = [
  'Analyzing your photo...',
  'Matching garment colors...',
  'Fitting outfit to your style...',
  'Rendering final look...',
];

export default function TryOnScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { wardrobeItems, createTryOn } = useApp();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [selectedGarments, setSelectedGarments] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const pickSelfie = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
      setResultUri(null);
      setShowComparison(false);
    }
  };

  const toggleGarment = (id: string) => {
    Haptics.selectionAsync();
    setSelectedGarments(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
    setResultUri(null);
  };

  const handleTryOn = async () => {
    if (!selfieUri || selectedGarments.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= PROCESSING_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 2500);

    try {
      const result = await createTryOn(selfieUri, selectedGarments);
      setResultUri(result.resultImageUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
    } finally {
      clearInterval(stepInterval);
      setIsProcessing(false);
    }
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelfieUri(null);
    setSelectedGarments([]);
    setResultUri(null);
    setShowComparison(false);
  };

  const selectedItems = wardrobeItems.filter(i => selectedGarments.includes(i.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: (insets.top || webTopInset) + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Virtual Try-On</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>See how outfits look on you</Text>
          </View>
          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBadge}
          >
            <MaterialCommunityIcons name="auto-fix" size={12} color="#FFF" />
            <Text style={styles.aiBadgeText}>AI Powered</Text>
          </LinearGradient>
        </Animated.View>

        {isProcessing ? (
          <Animated.View entering={FadeIn.duration(400)}>
            <LinearGradient
              colors={isDark ? ['rgba(236,72,153,0.08)', 'rgba(236,72,153,0.02)'] : ['rgba(236,72,153,0.06)', 'rgba(236,72,153,0.01)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.processingCard, shadows.medium]}
            >
              <View style={styles.processingIconWrap}>
                <LinearGradient
                  colors={['#EC4899', '#F472B6']}
                  style={styles.processingIconGradient}
                >
                  <ActivityIndicator size="large" color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.processingTitle, { color: colors.text }]}>Creating Your Look</Text>
              <Text style={[styles.processingStep, { color: colors.textSecondary }]}>
                {PROCESSING_STEPS[processingStep]}
              </Text>
              <View style={styles.stepsRow}>
                {PROCESSING_STEPS.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: idx <= processingStep ? '#EC4899' : colors.surfaceSecondary,
                        width: idx === processingStep ? 24 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.processingItems}>
                {selectedItems.slice(0, 3).map((item, idx) => (
                  <Image key={item.id} source={{ uri: item.imageUrl }} style={[styles.processingItemImg, idx > 0 && { marginLeft: -8 }]} contentFit="cover" />
                ))}
                <Text style={[styles.processingItemCount, { color: colors.textSecondary }]}>
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ) : resultUri ? (
          <Animated.View entering={FadeIn.duration(500)}>
            <View style={styles.resultHeader}>
              <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>Your Look</Text>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowComparison(!showComparison);
                }}
                style={[styles.compareToggle, { backgroundColor: showComparison ? colors.tint + '15' : colors.surfaceSecondary }]}
              >
                <Ionicons name="git-compare-outline" size={14} color={showComparison ? colors.tint : colors.textSecondary} />
                <Text style={[styles.compareText, { color: showComparison ? colors.tint : colors.textSecondary }]}>
                  {showComparison ? 'Hide Original' : 'Compare'}
                </Text>
              </Pressable>
            </View>

            {showComparison ? (
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonCol}>
                  <View style={[styles.comparisonLabel, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.comparisonLabelText, { color: colors.textSecondary }]}>Before</Text>
                  </View>
                  <View style={[styles.comparisonBox, { borderColor: colors.border }, shadows.soft]}>
                    <Image source={{ uri: selfieUri! }} style={styles.comparisonImage} contentFit="cover" />
                  </View>
                </View>
                <View style={styles.comparisonCol}>
                  <View style={[styles.comparisonLabel, { backgroundColor: '#EC489915' }]}>
                    <Text style={[styles.comparisonLabelText, { color: '#EC4899' }]}>After</Text>
                  </View>
                  <View style={[styles.comparisonBox, { borderColor: '#EC4899' }, shadows.soft]}>
                    <Image source={{ uri: resultUri }} style={styles.comparisonImage} contentFit="cover" transition={400} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={[styles.resultBox, { borderColor: '#EC4899' }, shadows.medium]}>
                <Image source={{ uri: resultUri }} style={styles.resultImage} contentFit="cover" transition={400} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.55)']}
                  style={styles.resultOverlay}
                >
                  <View style={styles.resultInfo}>
                    {selectedItems.slice(0, 3).map((item) => (
                      <View key={item.id} style={styles.resultItemBadge}>
                        <Image source={{ uri: item.imageUrl }} style={styles.resultItemImg} contentFit="cover" />
                      </View>
                    ))}
                    <Text style={styles.resultItemNames} numberOfLines={1}>
                      {selectedItems.map(i => i.name).join(' + ')}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            <View style={styles.resultActions}>
              <Pressable
                onPress={handleTryOn}
                style={({ pressed }) => [styles.actionButton, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
              >
                <LinearGradient
                  colors={['#EC4899', '#F472B6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="refresh" size={18} color="#FFF" />
                  <Text style={styles.actionButtonText}>Regenerate</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={reset}
                style={({ pressed }) => [
                  styles.actionButtonSecondary,
                  { backgroundColor: colors.surfaceSecondary, transform: [{ scale: pressed ? 0.96 : 1 }] },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
                <Text style={[styles.actionButtonSecondaryText, { color: colors.text }]}>Start Over</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInUp.delay(100).duration(400)}>
              <View style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: selfieUri ? '#27AE60' : '#EC4899' }]}>
                  {selfieUri ? (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  ) : (
                    <Text style={styles.stepNumberText}>1</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>Your Photo</Text>
              </View>
              <Pressable
                onPress={pickSelfie}
                style={({ pressed }) => [
                  styles.selfieBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selfieUri ? '#EC4899' : colors.border,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                  shadows.soft,
                ]}
              >
                {selfieUri ? (
                  <View>
                    <Image source={{ uri: selfieUri }} style={styles.selfieImage} contentFit="cover" />
                    <View style={[styles.changeBadge, { backgroundColor: colors.surface }, shadows.soft]}>
                      <Ionicons name="camera-outline" size={14} color="#EC4899" />
                      <Text style={[styles.changeBadgeText, { color: '#EC4899' }]}>Change</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.selfieEmpty}>
                    <LinearGradient
                      colors={['#EC489920', '#EC489908']}
                      style={styles.selfieIconWrap}
                    >
                      <Ionicons name="camera-outline" size={32} color="#EC4899" />
                    </LinearGradient>
                    <Text style={[styles.selfieEmptyTitle, { color: colors.text }]}>Add your photo</Text>
                    <Text style={[styles.selfieEmptyText, { color: colors.textSecondary }]}>
                      Tap to select from your gallery
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              <View style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: selectedGarments.length > 0 ? '#27AE60' : '#EC4899' }]}>
                  {selectedGarments.length > 0 ? (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  ) : (
                    <Text style={styles.stepNumberText}>2</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
                  Select Garments {selectedGarments.length > 0 ? `(${selectedGarments.length})` : ''}
                </Text>
              </View>
              <FlatList
                data={wardrobeItems}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                scrollEnabled={wardrobeItems.length > 0}
                renderItem={({ item }) => {
                  const selected = selectedGarments.includes(item.id);
                  return (
                    <Pressable
                      onPress={() => toggleGarment(item.id)}
                      style={({ pressed }) => [
                        styles.garmentCard,
                        {
                          borderColor: selected ? '#EC4899' : colors.border,
                          backgroundColor: colors.surface,
                          transform: [{ scale: pressed ? 0.96 : 1 }],
                        },
                        shadows.soft,
                      ]}
                    >
                      <Image source={{ uri: item.imageUrl }} style={styles.garmentImage} contentFit="cover" />
                      {selected && (
                        <LinearGradient
                          colors={['#EC4899', '#F472B6']}
                          style={styles.garmentCheck}
                        >
                          <Ionicons name="checkmark" size={14} color="#FFF" />
                        </LinearGradient>
                      )}
                      <Text style={[styles.garmentName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.garmentCategory, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.category}
                      </Text>
                    </Pressable>
                  );
                }}
                contentContainerStyle={{ gap: 10, paddingRight: 20 }}
                ListEmptyComponent={
                  <View style={styles.emptyGarments}>
                    <Ionicons name="shirt-outline" size={24} color={colors.tabIconDefault} />
                    <Text style={[styles.emptyGarmentsText, { color: colors.textSecondary }]}>
                      Add items to your wardrobe first
                    </Text>
                  </View>
                }
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={{ marginTop: 24 }}>
              <Pressable
                onPress={handleTryOn}
                disabled={!selfieUri || selectedGarments.length === 0}
                style={({ pressed }) => [
                  styles.tryOnButton,
                  {
                    opacity: (!selfieUri || selectedGarments.length === 0) ? 0.4 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#EC4899', '#F472B6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tryOnButtonGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#FFF" />
                  <Text style={styles.tryOnButtonText}>Try On</Text>
                </LinearGradient>
              </Pressable>
              <Text style={[styles.creditNote, { color: colors.textTertiary }]}>
                Uses 10 credits per try-on
              </Text>
            </Animated.View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 2 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  aiBadgeText: { fontFamily: 'Outfit_500Medium', fontSize: 11, color: '#FFF' },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: '#FFF' },
  stepLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  selfieBox: {
    height: 220,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 24,
  },
  selfieImage: { width: '100%', height: '100%' },
  selfieEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  selfieIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  selfieEmptyTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 16 },
  selfieEmptyText: { fontFamily: 'Outfit_400Regular', fontSize: 13 },
  changeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  changeBadgeText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  garmentCard: {
    width: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  garmentImage: { width: '100%', height: 90 },
  garmentCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  garmentName: { fontFamily: 'Outfit_500Medium', fontSize: 11, paddingHorizontal: 6, paddingTop: 5 },
  garmentCategory: { fontFamily: 'Outfit_400Regular', fontSize: 10, paddingHorizontal: 6, paddingBottom: 6 },
  emptyGarments: { paddingVertical: 20, alignItems: 'center', gap: 8 },
  emptyGarmentsText: { fontFamily: 'Outfit_400Regular', fontSize: 14 },
  tryOnButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tryOnButtonGradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  tryOnButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 17, color: '#FFF' },
  creditNote: { fontFamily: 'Outfit_400Regular', fontSize: 11, textAlign: 'center', marginTop: 8 },
  processingCard: {
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  processingIconWrap: {
    marginBottom: 4,
  },
  processingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 20 },
  processingStep: { fontFamily: 'Outfit_400Regular', fontSize: 14, textAlign: 'center' },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  processingItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  processingItemImg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  processingItemCount: { fontFamily: 'Outfit_400Regular', fontSize: 12 },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  compareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  compareText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  comparisonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonLabel: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  comparisonLabelText: { fontFamily: 'Outfit_500Medium', fontSize: 11 },
  comparisonBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  comparisonImage: { width: '100%', height: 280 },
  resultBox: {
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resultImage: { width: '100%', height: 380 },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultItemBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  resultItemImg: { width: '100%', height: '100%' },
  resultItemNames: { fontFamily: 'Outfit_500Medium', fontSize: 13, color: '#FFF', flex: 1 },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: '#FFF' },
  actionButtonSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonSecondaryText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
});
