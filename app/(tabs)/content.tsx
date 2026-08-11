import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { Outfit, CaptionResult } from '@/lib/demo-data';
import { shadows } from '@/constants/colors';

const TONES = [
  { key: 'casual', label: 'Casual', icon: 'chatbubble-outline' as const },
  { key: 'playful', label: 'Playful', icon: 'happy-outline' as const },
  { key: 'professional', label: 'Pro', icon: 'briefcase-outline' as const },
  { key: 'trendy', label: 'Trendy', icon: 'flame-outline' as const },
  { key: 'minimal', label: 'Minimal', icon: 'remove-outline' as const },
];

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram' as const, color: '#E1306C' },
  { key: 'tiktok', label: 'TikTok', icon: 'musical-notes-outline' as const, color: '#00C9B7' },
  { key: 'twitter', label: 'X / Twitter', icon: 'logo-twitter' as const, color: '#1DA1F2' },
  { key: 'pinterest', label: 'Pinterest', icon: 'pin-outline' as const, color: '#E60023' },
];

export default function ContentScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { outfits, savedOutfits, generateCaption } = useApp();
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedTone, setSelectedTone] = useState('casual');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [captionResult, setCaptionResult] = useState<CaptionResult | null>(null);
  const [copied, setCopied] = useState<'caption' | 'hashtags' | 'all' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const allOutfits = [...outfits, ...savedOutfits.filter(s => !outfits.some(o => o.id === s.id))];

  const handleSelectOutfit = (outfit: Outfit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOutfit(outfit);
    setCaptionResult(null);
    setCopied(null);
  };

  const handleGenerate = async () => {
    if (!selectedOutfit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    setCaptionResult(null);
    try {
      const result = await generateCaption(selectedOutfit.id, selectedTone, selectedPlatform);
      setCaptionResult(result);
    } catch {
      setCaptionResult({ caption: 'Looking great today!', hashtags: ['#OOTD', '#Fashion', '#ClosetAI'] });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (type: 'caption' | 'hashtags' | 'all') => {
    if (!captionResult) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let text = '';
    if (type === 'caption') text = captionResult.caption;
    else if (type === 'hashtags') text = captionResult.hashtags.join(' ');
    else text = `${captionResult.caption}\n\n${captionResult.hashtags.join(' ')}`;
    await Clipboard.setStringAsync(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const platformConfig = PLATFORMS.find(p => p.key === selectedPlatform);

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
            <Text style={[styles.title, { color: colors.text }]}>Content Studio</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Create share-ready captions</Text>
          </View>
          <LinearGradient
            colors={['#00C9B7', '#00E5D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBadge}
          >
            <MaterialCommunityIcons name="pencil-outline" size={12} color="#FFF" />
            <Text style={styles.aiBadgeText}>AI Writer</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Select Outfit</Text>
          <FlatList
            data={allOutfits}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={allOutfits.length > 0}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedOutfit?.id === item.id;
              return (
                <Pressable
                  onPress={() => handleSelectOutfit(item)}
                  style={({ pressed }) => [
                    styles.outfitChip,
                    {
                      borderColor: isSelected ? colors.tint : colors.border,
                      backgroundColor: isSelected ? colors.tint + '10' : colors.surface,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                    isSelected ? shadows.soft : {},
                  ]}
                >
                  <View style={styles.chipImages}>
                    {item.items.slice(0, 2).map((g, idx) => (
                      <Image
                        key={g.id + idx}
                        source={{ uri: g.imageUrl }}
                        style={[styles.chipImage, idx > 0 && { marginLeft: -10 }]}
                        contentFit="cover"
                      />
                    ))}
                  </View>
                  <Text
                    style={[styles.chipText, { color: isSelected ? colors.tint : colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
                  )}
                </Pressable>
              );
            }}
            contentContainerStyle={{ gap: 10, paddingRight: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyHint}>
                <Text style={[styles.emptyHintText, { color: colors.textSecondary }]}>
                  Create outfits first to generate captions
                </Text>
              </View>
            }
          />
        </Animated.View>

        {selectedOutfit && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginTop: 20 }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.chipRow}>
                {TONES.map(tone => {
                  const selected = selectedTone === tone.key;
                  return (
                    <Pressable
                      key={tone.key}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedTone(tone.key);
                        setCaptionResult(null);
                      }}
                      style={[
                        styles.toneChip,
                        {
                          backgroundColor: selected ? colors.tint + '15' : colors.surfaceSecondary,
                          borderColor: selected ? colors.tint + '40' : 'transparent',
                        },
                      ]}
                    >
                      <Ionicons
                        name={tone.icon}
                        size={14}
                        color={selected ? colors.tint : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.toneChipText,
                          { color: selected ? colors.tint : colors.textSecondary },
                        ]}
                      >
                        {tone.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Platform</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={styles.chipRow}>
                {PLATFORMS.map(platform => {
                  const selected = selectedPlatform === platform.key;
                  return (
                    <Pressable
                      key={platform.key}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedPlatform(platform.key);
                        setCaptionResult(null);
                      }}
                      style={[
                        styles.platformChip,
                        {
                          backgroundColor: selected ? platform.color + '15' : colors.surfaceSecondary,
                          borderColor: selected ? platform.color + '40' : 'transparent',
                        },
                      ]}
                    >
                      <Ionicons
                        name={platform.icon}
                        size={16}
                        color={selected ? platform.color : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.platformChipText,
                          { color: selected ? platform.color : colors.textSecondary },
                        ]}
                      >
                        {platform.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {selectedOutfit && !captionResult && !isGenerating && (
          <Animated.View entering={FadeIn.duration(400)}>
            <Pressable
              onPress={handleGenerate}
              style={({ pressed }) => [
                styles.generateButton,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={['#00C9B7', '#00E5D0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButtonGradient}
              >
                <Ionicons name="sparkles" size={20} color="#FFF" />
                <Text style={styles.generateButtonText}>Generate Caption</Text>
              </LinearGradient>
            </Pressable>
            <Text style={[styles.creditNote, { color: colors.textTertiary }]}>
              Uses 3 credits
            </Text>
          </Animated.View>
        )}

        {isGenerating && (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.generatingCard, { backgroundColor: colors.surface }, shadows.soft]}>
            <ActivityIndicator size="small" color="#00C9B7" />
            <Text style={[styles.generatingText, { color: colors.text }]}>
              Writing your {selectedTone} caption for {platformConfig?.label}...
            </Text>
          </Animated.View>
        )}

        {captionResult && (
          <Animated.View entering={FadeIn.duration(500)}>
            <View style={[styles.previewCard, { backgroundColor: colors.surface }, shadows.medium]}>
              <View style={styles.previewHeader}>
                <View style={styles.previewPlatform}>
                  <View style={[styles.previewPlatformIcon, { backgroundColor: (platformConfig?.color || '#00C9B7') + '15' }]}>
                    <Ionicons name={platformConfig?.icon || 'logo-instagram'} size={14} color={platformConfig?.color || '#00C9B7'} />
                  </View>
                  <Text style={[styles.previewPlatformText, { color: colors.text }]}>
                    {platformConfig?.label} Post
                  </Text>
                </View>
                <View style={[styles.toneBadge, { backgroundColor: colors.tint + '12' }]}>
                  <Text style={[styles.toneBadgeText, { color: colors.tint }]}>{selectedTone}</Text>
                </View>
              </View>

              {selectedOutfit && (
                <View style={[styles.previewOutfit, { borderColor: colors.border }]}>
                  {selectedOutfit.items.slice(0, 3).map((item, idx) => (
                    <Image
                      key={item.id + idx}
                      source={{ uri: item.imageUrl }}
                      style={[styles.previewOutfitImg, idx > 0 && { marginLeft: -8 }]}
                      contentFit="cover"
                    />
                  ))}
                  <Text style={[styles.previewOutfitName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {selectedOutfit.name}
                  </Text>
                </View>
              )}

              <View style={[styles.captionBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                <Text style={[styles.captionText, { color: colors.text }]}>{captionResult.caption}</Text>
              </View>

              <View style={styles.hashtagsRow}>
                {captionResult.hashtags.map(tag => (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      Haptics.selectionAsync();
                      Clipboard.setStringAsync(tag);
                    }}
                    style={[styles.hashtagChip, { backgroundColor: (platformConfig?.color || colors.tint) + '10' }]}
                  >
                    <Text style={[styles.hashtagText, { color: platformConfig?.color || colors.tint }]}>{tag}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={[styles.captionActions, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                <Pressable
                  onPress={() => handleCopy('all')}
                  style={({ pressed }) => [
                    styles.copyButton,
                    { transform: [{ scale: pressed ? 0.96 : 1 }] },
                  ]}
                >
                  <LinearGradient
                    colors={copied === 'all' ? ['#27AE60', '#2ECC71'] : ['#00C9B7', '#00E5D0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.copyButtonGradient}
                  >
                    <Ionicons name={copied === 'all' ? 'checkmark' : 'copy-outline'} size={16} color="#FFF" />
                    <Text style={styles.copyButtonText}>{copied === 'all' ? 'Copied!' : 'Copy All'}</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  onPress={() => handleCopy('caption')}
                  style={({ pressed }) => [
                    styles.smallCopyBtn,
                    { borderColor: colors.border, backgroundColor: copied === 'caption' ? '#27AE6012' : 'transparent', opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={[styles.smallCopyText, { color: copied === 'caption' ? '#27AE60' : colors.textSecondary }]}>
                    {copied === 'caption' ? 'Copied' : 'Caption'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleCopy('hashtags')}
                  style={({ pressed }) => [
                    styles.smallCopyBtn,
                    { borderColor: colors.border, backgroundColor: copied === 'hashtags' ? '#27AE6012' : 'transparent', opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={[styles.smallCopyText, { color: copied === 'hashtags' ? '#27AE60' : colors.textSecondary }]}>
                    {copied === 'hashtags' ? 'Copied' : 'Tags'}
                  </Text>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={handleGenerate}
                  hitSlop={8}
                >
                  <Ionicons name="refresh" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
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
  sectionLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  outfitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipImages: { flexDirection: 'row' },
  chipImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  chipText: { fontFamily: 'Outfit_500Medium', fontSize: 13, maxWidth: 90 },
  emptyHint: { paddingVertical: 20 },
  emptyHintText: { fontFamily: 'Outfit_400Regular', fontSize: 14 },
  chipRow: { flexDirection: 'row', gap: 8 },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  toneChipText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  platformChipText: { fontFamily: 'Outfit_500Medium', fontSize: 13 },
  generateButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#00C9B7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonGradient: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 17, color: '#FFF' },
  creditNote: { fontFamily: 'Outfit_400Regular', fontSize: 11, textAlign: 'center', marginTop: 8 },
  generatingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 20,
  },
  generatingText: { fontFamily: 'Outfit_500Medium', fontSize: 14, flex: 1 },
  previewCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  previewPlatform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewPlatformIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlatformText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  toneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  toneBadgeText: { fontFamily: 'Outfit_500Medium', fontSize: 11, textTransform: 'capitalize' },
  previewOutfit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0,
  },
  previewOutfitImg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  previewOutfitName: { fontFamily: 'Outfit_400Regular', fontSize: 12, flex: 1 },
  captionBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
  },
  captionText: { fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 22 },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  hashtagChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  hashtagText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  captionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  copyButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  copyButtonGradient: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  copyButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: '#FFF' },
  smallCopyBtn: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCopyText: { fontFamily: 'Outfit_500Medium', fontSize: 11 },
});
