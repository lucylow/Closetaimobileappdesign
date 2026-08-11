import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/lib/useTheme';
import { getSkinHistory, scanSkin } from '@/lib/skin';
import { demoSkinSnapshot, RoutineStep, SkinConcern, SkinSnapshot } from '@shared/skin';
import { shadows } from '@/constants/colors';
import { mockResultForToday, SKIN_MOCK_RESULT, SkinMockResult } from '@/lib/skin-mock-data';

type ScreenState = 'intro' | 'analyzing' | 'results';

async function imageToBase64(uri: string): Promise<string> {
  if (Platform.OS !== 'web') {
    return FileSystem.readAsStringAsync(uri, { encoding: 'base64' as any });
  }
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const value = String(reader.result || '');
      resolve(value.includes(',') ? value.split(',')[1] : value);
    };
    reader.onerror = () => reject(new Error('Unable to read image'));
    reader.readAsDataURL(blob);
  });
}

export default function SkinScreen() {
  const { colors, isDark } = useTheme();
  const { demoMode, credits } = useApp();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ScreenState>('results');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SkinSnapshot | null>(demoSkinSnapshot);
  const [mockResult, setMockResult] = useState<SkinMockResult | null>(SKIN_MOCK_RESULT);
  const [saveSnapshot, setSaveSnapshot] = useState(true);
  const [historyCount, setHistoryCount] = useState(0);
  const [error, setError] = useState('');
  const [progressLabel, setProgressLabel] = useState('Uploading your photo');

  const topInset = insets.top || (Platform.OS === 'web' ? 67 : 16);
  const bottomInset = insets.bottom || (Platform.OS === 'web' ? 34 : 18);

  const pickImage = async (camera: boolean) => {
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.78 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 5], quality: 0.78 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const startScan = async () => {
    if (!imageUri) return;
    setError('');
    setState('analyzing');
    setProgressLabel('Uploading your photo');
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setProgressLabel('Reading your skin snapshot');
      const base64 = await imageToBase64(imageUri);
      let result: SkinSnapshot;
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        result = { ...demoSkinSnapshot, id: `demo-${Date.now()}`, createdAt: new Date().toISOString() };
        setMockResult(mockResultForToday());
      } else {
        const response = await scanSkin(base64, saveSnapshot);
        result = response.snapshot;
        setMockResult(null);
      }
      setProgressLabel('Preparing your routine');
      await new Promise((resolve) => setTimeout(resolve, 450));
      setSnapshot(result);
      setState('results');
      if (saveSnapshot || !demoMode) {
        try {
          const history = await getSkinHistory();
          setHistoryCount(history.length);
        } catch {
          setHistoryCount((count) => count + 1);
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (scanError: any) {
      setState('intro');
      setError(scanError?.message || 'We could not complete that scan. Try a clear, well-lit photo.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const reset = () => {
    setState('intro');
    setSnapshot(null);
    setMockResult(null);
    setImageUri(null);
    setError('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 10 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close Skin Care">
          <Ionicons name="close" size={25} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerEyebrow, { color: colors.tint }]}>CLOSET A.I.</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Skin Care</Text>
        </View>
        <View style={{ width: 25 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {state === 'intro' && (
          <>
            <LinearGradient
              colors={isDark ? ['#2B1E1A', '#181110'] : ['#F8E3D4', '#FFF8F3']}
              style={styles.hero}
            >
              <View style={styles.heroIcon}><Ionicons name="sparkles" size={23} color="#A85F48" /></View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>A clearer starting point for your look.</Text>
              <Text style={[styles.heroText, { color: colors.textSecondary }]}>
                Get a high-level skin snapshot, a simple AM/PM routine, and styling ideas that work with the clothes you already own.
              </Text>
              <View style={styles.heroPills}>
                {['Hydration', 'Texture', 'Radiance'].map((label) => (
                  <View key={label} style={[styles.pill, { backgroundColor: colors.surface + 'C9' }]}>
                    <Text style={[styles.pillText, { color: colors.tint }]}>{label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.privacyTitle, { color: colors.text }]}>Privacy-first by design</Text>
                <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                  Your photo is sent for analysis only. We save the summary, not the original selfie, unless you choose to save a snapshot.
                </Text>
              </View>
            </View>

            {imageUri ? (
              <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
                <Pressable onPress={() => setImageUri(null)} style={styles.removePreview} hitSlop={8}>
                  <Ionicons name="close" size={16} color="#FFF" />
                </Pressable>
                <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Ready to scan</Text>
              </View>
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.photoIcon, { backgroundColor: colors.tint + '16' }]}>
                  <Ionicons name="person-outline" size={28} color={colors.tint} />
                </View>
                <Text style={[styles.photoTitle, { color: colors.text }]}>Use a clear, front-facing photo</Text>
                <Text style={[styles.photoText, { color: colors.textSecondary }]}>Natural light works best. Avoid heavy filters and face coverings.</Text>
              </View>
            )}

            <View style={styles.photoButtons}>
              <Pressable onPress={() => pickImage(true)} style={[styles.primaryPhotoButton, { backgroundColor: colors.tint }]} accessibilityRole="button">
                <Ionicons name="camera-outline" size={20} color="#FFF" />
                <Text style={styles.primaryPhotoText}>Take photo</Text>
              </Pressable>
              <Pressable onPress={() => pickImage(false)} style={[styles.secondaryPhotoButton, { borderColor: colors.border }]} accessibilityRole="button">
                <Ionicons name="images-outline" size={20} color={colors.tint} />
                <Text style={[styles.secondaryPhotoText, { color: colors.text }]}>Choose photo</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setSaveSnapshot((value) => !value)} style={styles.saveRow}>
              <View style={[styles.checkbox, { borderColor: saveSnapshot ? colors.tint : colors.border, backgroundColor: saveSnapshot ? colors.tint : 'transparent' }]}>
                {saveSnapshot && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.saveTitle, { color: colors.text }]}>Save my Skin Snapshot</Text>
                <Text style={[styles.saveText, { color: colors.textSecondary }]}>Keep the normalized summary for future comparisons.</Text>
              </View>
            </Pressable>

            {imageUri && (
              <Pressable onPress={startScan} style={[styles.scanButton, { backgroundColor: colors.text }]} accessibilityRole="button">
                <Ionicons name="sparkles-outline" size={20} color={colors.background} />
                <Text style={[styles.scanButtonText, { color: colors.background }]}>Create my snapshot</Text>
                <Text style={[styles.scanCost, { color: colors.background + '99' }]}>{demoMode ? 'Demo' : '8 credits'}</Text>
              </Pressable>
            )}
            {!demoMode && typeof credits === 'number' && <Text style={[styles.creditNote, { color: colors.textTertiary }]}>{credits} credits available</Text>}
            {historyCount > 0 && <Text style={[styles.historyNote, { color: colors.textSecondary }]}>{historyCount} saved snapshot{historyCount === 1 ? '' : 's'} available</Text>}
            {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
          </>
        )}

        {state === 'analyzing' && (
          <View style={styles.loadingState}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.loadingImage} contentFit="cover" />}
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingTitle, { color: colors.text }]}>{progressLabel}</Text>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>This usually takes less than a minute.</Text>
            <View style={styles.loadingSteps}>
              {['Upload', 'Analyze', 'Style plan'].map((step, index) => (
                <View key={step} style={styles.loadingStep}>
                  <View style={[styles.stepDot, { backgroundColor: colors.tint }]} />
                  <Text style={[styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
                  {index < 2 && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          </View>
        )}

        {state === 'results' && snapshot && (
          <ResultsView snapshot={snapshot} mockResult={mockResult} colors={colors} isDark={isDark} onReset={reset} />
        )}
      </ScrollView>
    </View>
  );
}

function ResultsView({ snapshot, mockResult, colors, isDark, onReset }: { snapshot: SkinSnapshot; mockResult: SkinMockResult | null; colors: any; isDark: boolean; onReset: () => void }) {
  const topConcerns = useMemo(() => snapshot.concerns.slice(0, 4), [snapshot.concerns]);
  const [showProducts, setShowProducts] = useState(true);
  const [showWardrobe, setShowWardrobe] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const isDemoResult = !!mockResult;
  return (
    <>
      {isDemoResult && (
        <View style={[styles.demoBanner, { backgroundColor: colors.surface, borderColor: colors.tint + '35' }]}>
          <View style={[styles.demoIcon, { backgroundColor: colors.tint + '16' }]}><Ionicons name="flask-outline" size={17} color={colors.tint} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.demoTitle, { color: colors.text }]}>Demo Skin Snapshot</Text>
            <Text style={[styles.demoText, { color: colors.textSecondary }]}>Fictional preview data. Use “New scan” to try the live YouCam path.</Text>
          </View>
        </View>
      )}
      <LinearGradient colors={isDark ? ['#2B1E1A', '#181110'] : ['#F8E3D4', '#FFF8F3']} style={styles.resultHero}>
        <View style={styles.resultBadge}><Ionicons name="checkmark" size={15} color="#FFF" /><Text style={styles.resultBadgeText}>SNAPSHOT READY</Text></View>
        <Text style={[styles.resultTitle, { color: colors.text }]}>{mockResult?.headline || 'Your skin, at a glance.'}</Text>
        <Text style={[styles.resultSummary, { color: colors.textSecondary }]}>{mockResult?.summary || snapshot.overallSummary}</Text>
        {!!snapshot.skinType && <Text style={[styles.skinType, { color: colors.tint }]}>{snapshot.skinType} skin profile</Text>}
        {mockResult && <View style={styles.scoreRow}><View><Text style={[styles.scoreValue, { color: colors.text }]}>{mockResult.overallScore}</Text><Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>overall snapshot score</Text></View><View style={styles.confidence}><Ionicons name="shield-checkmark-outline" size={16} color={colors.tint} /><Text style={[styles.confidenceText, { color: colors.tint }]}>{mockResult.confidence}% confidence</Text></View></View>}
      </LinearGradient>

      <View style={styles.resultActions}>
        <Pressable onPress={() => router.push('/(tabs)/outfits')} style={[styles.resultActionPrimary, { backgroundColor: colors.text }]}>
          <Ionicons name="shirt-outline" size={18} color={colors.background} />
          <Text style={[styles.resultActionPrimaryText, { color: colors.background }]}>Build my look</Text>
        </Pressable>
        <Pressable onPress={onReset} style={[styles.resultActionSecondary, { borderColor: colors.border }]}>
          <Ionicons name="refresh-outline" size={18} color={colors.tint} />
          <Text style={[styles.resultActionSecondaryText, { color: colors.text }]}>New scan</Text>
        </Pressable>
      </View>

      <SectionTitle title="Skin signals" subtitle="Visual guidance, not a diagnosis" colors={colors} />
      <View style={styles.concernsGrid}>
        {topConcerns.map((concern) => <ConcernCard key={concern.key} concern={concern} colors={colors} />)}
      </View>

      <SectionTitle title="Your gentle routine" subtitle="Keep it simple and consistent" colors={colors} />
      <RoutineCard routine={snapshot.routine} colors={colors} />

      <SectionTitle title="Skin → style" subtitle="Suggestions, not rules. Your taste comes first." colors={colors} />
      {snapshot.styleInsights.map((insight) => (
        <View key={insight.title} style={[styles.styleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.styleIcon, { backgroundColor: colors.tint + '16' }]}><Ionicons name="color-palette-outline" size={18} color={colors.tint} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.styleTitle, { color: colors.text }]}>{insight.title}</Text>
            <Text style={[styles.styleText, { color: colors.textSecondary }]}>{insight.detail}</Text>
            {!!insight.colorFamilies?.length && <View style={styles.colorChips}>{insight.colorFamilies.map((color) => <View key={color} style={[styles.colorChip, { backgroundColor: colors.tint + '12' }]}><Text style={[styles.colorChipText, { color: colors.tint }]}>{color}</Text></View>)}</View>}
          </View>
        </View>
      ))}

      {mockResult && (
        <>
          <SectionTitle title="Recommended products" subtitle="Categories first, not a prescription" colors={colors} />
          <CollapsibleToggle title="View the demo product edit" open={showProducts} onPress={() => setShowProducts((value) => !value)} colors={colors} />
          {showProducts && <View style={styles.productList}>{mockResult.products.map((product) => <ProductCard key={product.id} product={product} colors={colors} />)}</View>}

          <SectionTitle title="Progress to watch" subtitle="A simple way to compare future snapshots" colors={colors} />
          <CollapsibleToggle title="Show snapshot trends" open={showProgress} onPress={() => setShowProgress((value) => !value)} colors={colors} />
          {showProgress && <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>{mockResult.progress.map((item) => <View key={item.label} style={styles.progressRow}><View style={styles.progressHeader}><Text style={[styles.progressLabel, { color: colors.text }]}>{item.label}</Text><Text style={[styles.progressChange, { color: item.change >= 0 ? colors.success : colors.warning }]}>{item.change >= 0 ? '+' : ''}{item.change}%</Text></View><View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}><View style={[styles.progressFill, { width: `${item.value}%`, backgroundColor: colors.tint }]} /></View></View>)}</View>}

          <SectionTitle title="Skin × wardrobe" subtitle="Style guidance, never style rules" colors={colors} />
          <CollapsibleToggle title="Open wardrobe advice" open={showWardrobe} onPress={() => setShowWardrobe((value) => !value)} colors={colors} />
          {showWardrobe && <View style={[styles.wardrobeAdviceCard, { backgroundColor: colors.surface }]}>{mockResult.wardrobeAdvice.map((advice, index) => <View key={advice} style={styles.adviceRow}><View style={[styles.adviceNumber, { backgroundColor: colors.tint + '16' }]}><Text style={[styles.adviceNumberText, { color: colors.tint }]}>{index + 1}</Text></View><Text style={[styles.adviceText, { color: colors.textSecondary }]}>{advice}</Text></View>)}</View>}
        </>
      )}

      <View style={[styles.disclaimer, { backgroundColor: colors.surfaceSecondary }]}>
        <Ionicons name="information-circle-outline" size={17} color={colors.textTertiary} />
        <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>This snapshot is general wellness guidance, not medical advice. For persistent or concerning symptoms, consult a qualified professional.</Text>
      </View>
    </>
  );
}

function CollapsibleToggle({ title, open, onPress, colors }: { title: string; open: boolean; onPress: () => void; colors: any }) {
  return <Pressable onPress={onPress} style={[styles.collapsibleToggle, { backgroundColor: colors.surfaceSecondary }]}><Text style={[styles.collapsibleText, { color: colors.text }]}>{title}</Text><Ionicons name={open ? "chevron-up" : "chevron-down"} size={17} color={colors.tint} /></Pressable>;
}

function ProductCard({ product, colors }: { product: SkinMockResult['products'][number]; colors: any }) {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = { cleanser: 'water-outline', serum: 'beaker-outline', moisturizer: 'heart-outline', spf: 'sunny-outline', treatment: 'sparkles-outline' };
  return <View style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.productIcon, { backgroundColor: colors.tint + '16' }]}><Ionicons name={icons[product.category] || 'sparkles-outline'} size={19} color={colors.tint} /></View><View style={{ flex: 1 }}><View style={styles.productTitleRow}><Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text><Text style={[styles.productPrice, { color: colors.tint }]}>${product.price}</Text></View><Text style={[styles.productMeta, { color: colors.textTertiary }]}>{product.usage} · {product.size}</Text><Text style={[styles.productWhy, { color: colors.textSecondary }]}>{product.why}</Text><View style={styles.productTags}>{product.tags.map((tag) => <View key={tag} style={[styles.productTag, { backgroundColor: colors.tint + '12' }]}><Text style={[styles.productTagText, { color: colors.tint }]}>{tag}</Text></View>)}</View></View></View>;
}

function SectionTitle({ title, subtitle, colors }: { title: string; subtitle: string; colors: any }) {
  return <View style={styles.sectionTitleRow}><View><Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text></View></View>;
}

function ConcernCard({ concern, colors }: { concern: SkinConcern; colors: any }) {
  const color = concern.severityBand === 'high' ? colors.warning : colors.tint;
  return <View style={[styles.concernCard, { backgroundColor: colors.surface }, shadows.soft]}>
    <View style={styles.concernTop}><Text style={[styles.concernLabel, { color: colors.text }]}>{concern.label}</Text>{concern.score !== null && <Text style={[styles.concernScore, { color }]}>{concern.score}</Text>}</View>
    <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>{concern.score !== null && <View style={[styles.progressFill, { backgroundColor: color, width: `${concern.score}%` }]} />}</View>
    <Text style={[styles.concernAction, { color: colors.textSecondary }]} numberOfLines={3}>{concern.action}</Text>
  </View>;
}

function RoutineCard({ routine, colors }: { routine: RoutineStep[]; colors: any }) {
  return <View style={[styles.routineCard, { backgroundColor: colors.surface }, shadows.soft]}>
    {(['AM', 'PM'] as const).map((time) => <View key={time} style={styles.routineGroup}>
      <View style={[styles.timeBadge, { backgroundColor: colors.tint + '14' }]}><Text style={[styles.timeText, { color: colors.tint }]}>{time}</Text></View>
      <View style={styles.routineSteps}>{routine.filter((step) => step.time === time).map((step) => <View key={`${time}-${step.order}`} style={styles.routineStep}>
        <View style={[styles.routineDot, { backgroundColor: colors.tint }]} />
        <View style={{ flex: 1 }}><Text style={[styles.routineCategory, { color: colors.text }]}>{step.category}{step.optional ? ' · optional' : ''}</Text><Text style={[styles.routineNotes, { color: colors.textSecondary }]}>{step.notes}</Text></View>
      </View>)}</View>
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 13 },
  headerTitleWrap: { alignItems: 'center' },
  headerEyebrow: { fontFamily: 'Outfit_700Bold', fontSize: 9, letterSpacing: 1.3 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
  content: { paddingHorizontal: 20 },
  hero: { borderRadius: 26, padding: 20, marginBottom: 14 },
  heroIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, lineHeight: 33, maxWidth: 310 },
  heroText: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 21, marginTop: 10 },
  heroPills: { flexDirection: 'row', gap: 7, marginTop: 17, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
  privacyCard: { flexDirection: 'row', gap: 11, padding: 14, borderRadius: 17, borderWidth: 1, marginBottom: 14 },
  privacyTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  privacyText: { fontFamily: 'Outfit_400Regular', fontSize: 11, lineHeight: 16, marginTop: 3 },
  photoPlaceholder: { minHeight: 190, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 12 },
  photoIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  photoTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, textAlign: 'center' },
  photoText: { fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 5, maxWidth: 250 },
  previewCard: { height: 250, borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  previewImage: { width: '100%', height: '100%' },
  removePreview: { position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  previewLabel: { position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(0,0,0,0.55)', color: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, overflow: 'hidden', fontFamily: 'Outfit_500Medium', fontSize: 11 },
  photoButtons: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  primaryPhotoButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderRadius: 15, paddingVertical: 14 },
  primaryPhotoText: { color: '#FFF', fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  secondaryPhotoButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderRadius: 15, borderWidth: 1, paddingVertical: 14 },
  secondaryPhotoText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 15 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  saveTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  saveText: { fontFamily: 'Outfit_400Regular', fontSize: 11, marginTop: 2 },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 16, paddingVertical: 16 },
  scanButtonText: { fontFamily: 'Outfit_700Bold', fontSize: 15 },
  scanCost: { fontFamily: 'Outfit_500Medium', fontSize: 11, marginLeft: 5 },
  creditNote: { textAlign: 'center', fontFamily: 'Outfit_400Regular', fontSize: 11, marginTop: 8 },
  historyNote: { textAlign: 'center', fontFamily: 'Outfit_400Regular', fontSize: 11, marginTop: 13 },
  errorText: { textAlign: 'center', fontFamily: 'Outfit_500Medium', fontSize: 12, lineHeight: 17, marginTop: 12 },
  loadingState: { alignItems: 'center', paddingTop: 25 },
  loadingImage: { width: 190, height: 235, borderRadius: 26, marginBottom: 28 },
  loadingTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, marginTop: 18 },
  loadingText: { fontFamily: 'Outfit_400Regular', fontSize: 13, marginTop: 6 },
  loadingSteps: { flexDirection: 'row', alignItems: 'center', marginTop: 38 },
  loadingStep: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepText: { fontFamily: 'Outfit_500Medium', fontSize: 11, marginLeft: 5 },
  stepLine: { width: 25, height: 1, marginHorizontal: 8 },
  resultHero: { borderRadius: 26, padding: 20, marginBottom: 15 },
  resultBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, backgroundColor: '#A85F48', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  resultBadgeText: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 9, letterSpacing: 1 },
  resultTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, marginTop: 17 },
  resultSummary: { fontFamily: 'Outfit_400Regular', fontSize: 14, lineHeight: 21, marginTop: 8 },
  skinType: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, marginTop: 15 },
  resultActions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  resultActionPrimary: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderRadius: 15, paddingVertical: 14 },
  resultActionPrimaryText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  resultActionSecondary: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15 },
  resultActionSecondaryText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  sectionTitleRow: { marginBottom: 11, marginTop: 5 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 19 },
  sectionSubtitle: { fontFamily: 'Outfit_400Regular', fontSize: 11, marginTop: 2 },
  concernsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  concernCard: { width: '48%', borderRadius: 16, padding: 13, minHeight: 116 },
  concernTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  concernLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, flex: 1 },
  concernScore: { fontFamily: 'Outfit_700Bold', fontSize: 19 },
  progressTrack: { height: 5, borderRadius: 3, marginTop: 13, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  concernAction: { fontFamily: 'Outfit_400Regular', fontSize: 11, lineHeight: 15, marginTop: 11 },
  routineCard: { borderRadius: 18, padding: 15, marginBottom: 22 },
  routineGroup: { flexDirection: 'row', gap: 13, marginBottom: 15 },
  timeBadge: { width: 34, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  timeText: { fontFamily: 'Outfit_700Bold', fontSize: 11 },
  routineSteps: { flex: 1, gap: 12 },
  routineStep: { flexDirection: 'row', gap: 9 },
  routineDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  routineCategory: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  routineNotes: { fontFamily: 'Outfit_400Regular', fontSize: 11, lineHeight: 15, marginTop: 2 },
  styleCard: { flexDirection: 'row', gap: 11, borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 10 },
  styleIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  styleTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
  styleText: { fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 17, marginTop: 4 },
  colorChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 9 },
  colorChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  colorChipText: { fontFamily: 'Outfit_500Medium', fontSize: 10 },
  disclaimer: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 13, marginTop: 14 },
  disclaimerText: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 10, lineHeight: 15 },
  demoBanner: { flexDirection: 'row', gap: 10, padding: 13, borderRadius: 17, borderWidth: 1, marginBottom: 13 },
  demoIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  demoTitle: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  demoText: { fontFamily: 'Outfit_400Regular', fontSize: 11, lineHeight: 16, marginTop: 3 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 17 },
  scoreValue: { fontFamily: 'Outfit_700Bold', fontSize: 42, lineHeight: 44 },
  scoreLabel: { fontFamily: 'Outfit_400Regular', fontSize: 10 },
  confidence: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.65)' },
  confidenceText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
  collapsibleToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 13, marginBottom: 10 },
  collapsibleText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  productList: { gap: 9, marginBottom: 22 },
  productCard: { flexDirection: 'row', gap: 11, padding: 13, borderRadius: 16, borderWidth: 1 },
  productIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  productTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  productName: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, flex: 1 },
  productPrice: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
  productMeta: { fontFamily: 'Outfit_400Regular', fontSize: 10, marginTop: 3 },
  productWhy: { fontFamily: 'Outfit_400Regular', fontSize: 11, lineHeight: 15, marginTop: 5 },
  productTags: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 7 },
  productTag: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  productTagText: { fontFamily: 'Outfit_500Medium', fontSize: 9 },
  progressCard: { padding: 15, borderRadius: 17, marginBottom: 22, gap: 14 },
  progressRow: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
  progressChange: { fontFamily: 'Outfit_600SemiBold', fontSize: 11 },
  wardrobeAdviceCard: { padding: 15, borderRadius: 17, marginBottom: 22, gap: 13 },
  adviceRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  adviceNumber: { width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adviceNumberText: { fontFamily: 'Outfit_700Bold', fontSize: 11 },
  adviceText: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 12, lineHeight: 17 },
});