import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { Outfit } from '@/lib/demo-data';
import { shadows } from '@/constants/colors';

const OCCASIONS = [
  { key: 'all', label: 'All', icon: 'grid-outline' as const },
  { key: 'casual', label: 'Casual', icon: 'cafe-outline' as const },
  { key: 'office', label: 'Office', icon: 'briefcase-outline' as const },
  { key: 'date', label: 'Date Night', icon: 'heart-outline' as const },
  { key: 'party', label: 'Party', icon: 'musical-notes-outline' as const },
  { key: 'business', label: 'Business', icon: 'business-outline' as const },
];

function getScoreColor(score: number) {
  if (score >= 0.9) return '#27AE60';
  if (score >= 0.75) return '#8BC34A';
  if (score >= 0.6) return '#F39C12';
  return '#E74C3C';
}

function getScoreLabel(score: number) {
  if (score >= 0.9) return 'Perfect';
  if (score >= 0.75) return 'Great';
  if (score >= 0.6) return 'Good';
  return 'Try';
}

function ScoreBadge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const pct = Math.round(score * 100);

  return (
    <View style={[scoreBadgeStyles.container, { backgroundColor: color + '15', borderColor: color + '25' }]}>
      <View style={[scoreBadgeStyles.dot, { backgroundColor: color }]} />
      <Text style={[scoreBadgeStyles.text, { color }]}>{pct}%</Text>
      <Text style={[scoreBadgeStyles.label, { color: color + 'CC' }]}>{label}</Text>
    </View>
  );
}

const scoreBadgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: 'Outfit_700Bold', fontSize: 12 },
  label: { fontFamily: 'Outfit_400Regular', fontSize: 10 },
});

function OutfitCard({ outfit, colors, isDark, onRate, onSave, onPress, index }: {
  outfit: Outfit;
  colors: any;
  isDark: boolean;
  onRate: (id: string, r: 'like' | 'dislike') => void;
  onSave: (id: string) => void;
  onPress: (id: string) => void;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(400)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress(outfit.id);
        }}
        style={({ pressed }) => [
          styles.outfitCard,
          { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] },
          shadows.medium,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardImages}>
            {outfit.items.slice(0, 4).map((item, idx) => (
              <View key={item.id + idx} style={[styles.cardImageWrap, idx > 0 && { marginLeft: -14 }, { zIndex: 4 - idx, borderColor: colors.surface }]}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={300}
                />
              </View>
            ))}
            {outfit.items.length > 4 && (
              <View style={[styles.cardImageWrap, { marginLeft: -14, backgroundColor: colors.surfaceSecondary, borderColor: colors.surface }]}>
                <Text style={[styles.moreItemsText, { color: colors.textSecondary }]}>+{outfit.items.length - 4}</Text>
              </View>
            )}
          </View>
          {outfit.score > 0 && <ScoreBadge score={outfit.score} />}
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{outfit.name}</Text>
          <Text style={[styles.cardReason, { color: colors.textSecondary }]} numberOfLines={2}>
            {outfit.reason}
          </Text>

          <View style={styles.cardMeta}>
            {outfit.occasion ? (
              <LinearGradient
                colors={[colors.tint + '18', colors.tint + '08']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.occasionBadge}
              >
                <Ionicons name="flag-outline" size={11} color={colors.tint} />
                <Text style={[styles.occasionText, { color: colors.tint }]}>{outfit.occasion}</Text>
              </LinearGradient>
            ) : null}
            {outfit.tags.slice(0, 2).map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.cardActions, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onRate(outfit.id, 'like');
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: outfit.rating === 'like' ? '#E74C3C12' : 'transparent', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <Ionicons
              name={outfit.rating === 'like' ? 'heart' : 'heart-outline'}
              size={18}
              color={outfit.rating === 'like' ? '#E74C3C' : colors.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSave(outfit.id);
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: outfit.saved ? colors.tint + '12' : 'transparent', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <Ionicons
              name={outfit.saved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={outfit.saved ? colors.tint : colors.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPress(outfit.id);
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.actionBtn, { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.actionBtnLabel, { color: colors.textSecondary }]}>Why?</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={[styles.aiLabel, { backgroundColor: isDark ? 'rgba(110,74,224,0.12)' : 'rgba(110,74,224,0.06)' }]}>
            <MaterialCommunityIcons name="auto-fix" size={11} color="#6E4AE0" />
            <Text style={[styles.aiLabelText, { color: '#6E4AE0' }]}>AI</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function OutfitsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { outfits, savedOutfits, rateOutfit, saveOutfit, unsaveOutfit, generateOutfits, wardrobeItems } = useApp();
  const [tab, setTab] = useState<'suggested' | 'saved'>('suggested');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weather, setWeather] = useState('');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const sourceOutfits = tab === 'suggested' ? outfits : savedOutfits;

  const displayOutfits = selectedOccasion === 'all'
    ? sourceOutfits
    : sourceOutfits.filter(o =>
        o.occasion?.toLowerCase().includes(selectedOccasion) ||
        o.tags.some(t => t.toLowerCase().includes(selectedOccasion))
      );

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRefreshing(true);
    try {
      await generateOutfits(
        selectedOccasion === 'all' ? undefined : selectedOccasion,
        weather.trim() || undefined,
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [generateOutfits, selectedOccasion, weather]);

  const hasEnoughItems = wardrobeItems.length >= 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#16141E', '#0D0D0D'] : ['#EDE6F5', '#FAF7F2']}
        style={[styles.headerGradient, { paddingTop: (insets.top || webTopInset) + 12 }]}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Outfits</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {outfits.length} suggestion{outfits.length !== 1 ? 's' : ''} {savedOutfits.length > 0 ? `\u00B7 ${savedOutfits.length} saved` : ''}
            </Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing || !hasEnoughItems}
            hitSlop={12}
            style={({ pressed }) => [
              { opacity: (isRefreshing || !hasEnoughItems) ? 0.5 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={['#6E4AE0', '#9B6DFF']}
              style={styles.refreshBtnGradient}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="sparkles" size={18} color="#FFF" />
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={styles.tabRow}>
          {(['suggested', 'saved'] as const).map(t => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTab(t);
                }}
                style={({ pressed }) => [
                  styles.tabButton,
                  {
                    backgroundColor: active ? (t === 'suggested' ? '#6E4AE0' : colors.tint) : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Ionicons
                  name={t === 'suggested' ? 'sparkles-outline' : 'bookmark-outline'}
                  size={14}
                  color={active ? '#FFF' : colors.textSecondary}
                />
                <Text style={[styles.tabButtonText, { color: active ? '#FFF' : colors.textSecondary }]}>
                  {t === 'suggested' ? 'Suggested' : `Saved (${savedOutfits.length})`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <Animated.View entering={FadeIn.delay(150).duration(300)}>
        <View style={[styles.weatherRow, { backgroundColor: isDark ? 'rgba(0,201,183,0.06)' : 'rgba(0,201,183,0.04)', borderColor: isDark ? 'rgba(0,201,183,0.12)' : 'rgba(0,201,183,0.08)' }]}>
          <LinearGradient
            colors={['#00C9B7', '#00E5D0']}
            style={styles.weatherIcon}
          >
            <Ionicons name="partly-sunny-outline" size={14} color="#FFF" />
          </LinearGradient>
          <TextInput
            style={[styles.weatherInput, { color: colors.text }]}
            placeholder="Weather? e.g. 72F sunny, rainy, cold..."
            placeholderTextColor={colors.textTertiary}
            value={weather}
            onChangeText={setWeather}
            returnKeyType="done"
          />
          {weather.length > 0 && (
            <Pressable onPress={() => setWeather('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(200).duration(300)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.occasionRow}
        >
          {OCCASIONS.map(occ => {
            const active = selectedOccasion === occ.key;
            return (
              <Pressable
                key={occ.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedOccasion(occ.key);
                }}
                style={({ pressed }) => [
                  styles.occasionChip,
                  {
                    backgroundColor: active ? '#6E4AE015' : isDark ? 'rgba(255,255,255,0.04)' : colors.surfaceSecondary,
                    borderColor: active ? '#6E4AE030' : 'transparent',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Ionicons
                  name={occ.icon}
                  size={14}
                  color={active ? '#6E4AE0' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.occasionChipText,
                    { color: active ? '#6E4AE0' : colors.textSecondary },
                  ]}
                >
                  {occ.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {displayOutfits.length === 0 ? (
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
          <LinearGradient
            colors={isDark ? ['rgba(110,74,224,0.1)', 'rgba(110,74,224,0.02)'] : ['rgba(110,74,224,0.08)', 'rgba(110,74,224,0.01)']}
            style={styles.emptyIconWrap}
          >
            <Ionicons
              name={tab === 'suggested' ? 'sparkles-outline' : 'bookmark-outline'}
              size={40}
              color="#6E4AE0"
            />
          </LinearGradient>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {tab === 'suggested' ? 'No outfit suggestions' : 'No saved outfits'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {tab === 'suggested'
              ? hasEnoughItems
                ? 'Tap the sparkle button to generate AI-powered outfit ideas'
                : 'Add at least 2 items to your wardrobe to get started'
              : 'Heart outfits you love to save them here'}
          </Text>
          {tab === 'suggested' && hasEnoughItems && (
            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              style={({ pressed }) => [styles.generateBtn, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
            >
              <LinearGradient
                colors={['#6E4AE0', '#9B6DFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateBtnGradient}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#FFF" />
                    <Text style={styles.generateBtnText}>Generate Outfits</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          )}
        </Animated.View>
      ) : (
        <FlatList
          data={displayOutfits}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <OutfitCard
              outfit={item}
              colors={colors}
              isDark={isDark}
              index={index}
              onRate={(id, r) => rateOutfit(id, r)}
              onSave={(id) => item.saved ? unsaveOutfit(id) : saveOutfit(id)}
              onPress={(id) => router.push({ pathname: '/outfit-detail', params: { id } })}
            />
          )}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      )}

      {isRefreshing && displayOutfits.length > 0 && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.loadingOverlay}>
          <LinearGradient
            colors={[colors.background + '00', colors.background]}
            style={styles.loadingGradient}
          >
            <View style={[styles.loadingPill, { backgroundColor: colors.surface }, shadows.medium]}>
              <ActivityIndicator size="small" color="#6E4AE0" />
              <Text style={[styles.loadingText, { color: colors.text }]}>Creating outfits with AI...</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 26 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 2 },
  refreshBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E4AE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  tabButtonText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  weatherIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherInput: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    paddingVertical: 2,
  },
  occasionRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 14,
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
  },
  occasionChipText: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  listContent: { paddingHorizontal: 20, gap: 14 },
  outfitCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  cardImages: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  moreItemsText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  cardBody: { padding: 14, paddingTop: 10 },
  cardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 17, marginBottom: 4 },
  cardReason: { fontFamily: 'Outfit_400Regular', fontSize: 14, marginBottom: 10, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  occasionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  occasionText: { fontFamily: 'Outfit_500Medium', fontSize: 11 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontFamily: 'Outfit_500Medium', fontSize: 11 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnLabel: { fontFamily: 'Outfit_500Medium', fontSize: 12 },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  aiLabelText: { fontFamily: 'Outfit_600SemiBold', fontSize: 10 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22 },
  emptySubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  generateBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#6E4AE0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  generateBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#FFF' },
  loadingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loadingText: { fontFamily: 'Outfit_500Medium', fontSize: 14 },
});
