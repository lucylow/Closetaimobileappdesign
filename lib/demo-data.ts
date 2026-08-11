export interface WardrobeItem {
  id: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessories';
  color: string;
  brand: string;
  imageUrl: string;
  tags: string[];
  usageCount: number;
  lastWorn: string | null;
  notes: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: WardrobeItem[];
  tags: string[];
  reason: string;
  occasion: string;
  rating: 'like' | 'neutral' | 'dislike' | null;
  saved: boolean;
  explanation: string;
  score: number;
  imageUrl?: string;
}

export interface TryOnResult {
  id: string;
  selfieUri: string;
  garmentIds: string[];
  resultImageUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  createdAt: string;
}

export interface CaptionResult {
  caption: string;
  hashtags: string[];
  styledImageUrl?: string;
}

export const CATEGORY_ICONS: Record<string, { icon: string; family: string }> = {
  top: { icon: 'shirt-outline', family: 'Ionicons' },
  bottom: { icon: 'body-outline', family: 'Ionicons' },
  dress: { icon: 'woman-outline', family: 'Ionicons' },
  outerwear: { icon: 'cloudy-outline', family: 'Ionicons' },
  shoes: { icon: 'footsteps-outline', family: 'Ionicons' },
  accessories: { icon: 'watch-outline', family: 'Ionicons' },
};

export const CATEGORIES = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories'] as const;

export const COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Navy', hex: '#1B2838' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Red', hex: '#C0392B' },
  { name: 'Blue', hex: '#2980B9' },
  { name: 'Green', hex: '#27AE60' },
  { name: 'Pink', hex: '#E91E8C' },
  { name: 'Purple', hex: '#8E44AD' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Teal', hex: '#16A085' },
];

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
  'https://images.unsplash.com/photo-1434389677669-e08b4cda3a38?w=400',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
];

export const demoWardrobeItems: WardrobeItem[] = [
  {
    id: 'demo-1',
    name: 'Classic White Tee',
    category: 'top',
    color: 'White',
    brand: 'Everlane',
    imageUrl: DEMO_IMAGES[0],
    tags: ['casual', 'essential', 'summer'],
    usageCount: 12,
    lastWorn: '2026-02-15',
    notes: 'Perfect basic',
    createdAt: '2026-01-01',
  },
  {
    id: 'demo-2',
    name: 'Navy Blazer',
    category: 'outerwear',
    color: 'Navy',
    brand: 'J.Crew',
    imageUrl: DEMO_IMAGES[1],
    tags: ['office', 'formal', 'versatile'],
    usageCount: 8,
    lastWorn: '2026-02-10',
    notes: 'Great for meetings',
    createdAt: '2026-01-05',
  },
  {
    id: 'demo-3',
    name: 'Silk Blouse',
    category: 'top',
    color: 'Beige',
    brand: 'Reformation',
    imageUrl: DEMO_IMAGES[2],
    tags: ['elegant', 'date night'],
    usageCount: 5,
    lastWorn: '2026-02-12',
    notes: '',
    createdAt: '2026-01-10',
  },
  {
    id: 'demo-4',
    name: 'Dark Wash Jeans',
    category: 'bottom',
    color: 'Blue',
    brand: "Levi's",
    imageUrl: DEMO_IMAGES[3],
    tags: ['casual', 'everyday', 'denim'],
    usageCount: 20,
    lastWorn: '2026-02-18',
    notes: 'Go-to jeans',
    createdAt: '2026-01-02',
  },
  {
    id: 'demo-5',
    name: 'White Sneakers',
    category: 'shoes',
    color: 'White',
    brand: 'Common Projects',
    imageUrl: DEMO_IMAGES[4],
    tags: ['casual', 'clean', 'versatile'],
    usageCount: 15,
    lastWorn: '2026-02-17',
    notes: '',
    createdAt: '2026-01-03',
  },
  {
    id: 'demo-6',
    name: 'Leather Jacket',
    category: 'outerwear',
    color: 'Black',
    brand: 'AllSaints',
    imageUrl: DEMO_IMAGES[5],
    tags: ['edgy', 'night out', 'cool'],
    usageCount: 6,
    lastWorn: '2026-02-08',
    notes: 'Statement piece',
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-7',
    name: 'Striped Oxford',
    category: 'top',
    color: 'Blue',
    brand: 'Brooks Brothers',
    imageUrl: DEMO_IMAGES[6],
    tags: ['office', 'preppy', 'smart casual'],
    usageCount: 9,
    lastWorn: '2026-02-14',
    notes: '',
    createdAt: '2026-01-20',
  },
  {
    id: 'demo-8',
    name: 'Chino Pants',
    category: 'bottom',
    color: 'Beige',
    brand: 'Bonobos',
    imageUrl: DEMO_IMAGES[7],
    tags: ['smart casual', 'office', 'versatile'],
    usageCount: 11,
    lastWorn: '2026-02-16',
    notes: '',
    createdAt: '2026-01-08',
  },
];

export const demoOutfits: Outfit[] = [
  {
    id: 'outfit-1',
    name: 'Smart Casual Friday',
    items: [demoWardrobeItems[6], demoWardrobeItems[3], demoWardrobeItems[4]],
    tags: ['office', 'smart casual', 'friday'],
    reason: 'Perfect balance of professional and relaxed',
    occasion: 'Office',
    rating: null,
    saved: false,
    explanation: 'The striped oxford adds polish while dark jeans and white sneakers keep it relaxed. Great for a Friday office look that transitions to happy hour.',
    score: 0.91,
  },
  {
    id: 'outfit-2',
    name: 'Weekend Brunch',
    items: [demoWardrobeItems[0], demoWardrobeItems[7], demoWardrobeItems[4]],
    tags: ['brunch', 'casual', 'weekend'],
    reason: 'Effortlessly put-together for a relaxed meal',
    occasion: 'Brunch',
    rating: null,
    saved: false,
    explanation: 'A classic white tee with chinos creates a clean, relaxed vibe. The white sneakers tie it together for an effortless weekend look.',
    score: 0.88,
  },
  {
    id: 'outfit-3',
    name: 'Date Night',
    items: [demoWardrobeItems[2], demoWardrobeItems[3], demoWardrobeItems[5]],
    tags: ['date', 'evening', 'chic'],
    reason: 'Elevated evening look with edge',
    occasion: 'Date Night',
    rating: null,
    saved: false,
    explanation: 'The silk blouse adds sophistication, while the leather jacket brings edge. Dark jeans ground the look, making it perfect for dinner and drinks.',
    score: 0.94,
  },
  {
    id: 'outfit-4',
    name: 'Board Meeting',
    items: [demoWardrobeItems[6], demoWardrobeItems[7], demoWardrobeItems[1]],
    tags: ['formal', 'professional', 'meeting'],
    reason: 'Polished and commanding presence',
    occasion: 'Business',
    rating: null,
    saved: false,
    explanation: 'Navy blazer over a striped oxford with chinos strikes the right balance between approachable and authoritative for important meetings.',
    score: 0.95,
  },
];

export const demoCaptions: CaptionResult[] = [
  {
    caption: 'Friday vibes in full effect. Keeping it smart but never boring.',
    hashtags: ['#OOTD', '#SmartCasual', '#FridayStyle', '#WardrobeGoals', '#ClosetAI'],
  },
  {
    caption: 'Brunch-ready and sunshine approved. Simple done right.',
    hashtags: ['#BrunchOutfit', '#WeekendStyle', '#MinimalFashion', '#CleanAesthetic', '#ClosetAI'],
  },
  {
    caption: 'When the night calls for a little edge and a lot of confidence.',
    hashtags: ['#DateNight', '#EveningWear', '#ChicStyle', '#FashionInspo', '#ClosetAI'],
  },
];

export const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Scan Your Closet',
    subtitle: 'Snap photos of your clothes and let AI organize your entire wardrobe digitally.',
    iconName: 'camera-outline' as const,
  },
  {
    id: '2',
    title: 'Get Styled by AI',
    subtitle: 'Receive personalized outfit suggestions based on your style, weather, and occasion.',
    iconName: 'sparkles-outline' as const,
  },
  {
    id: '3',
    title: 'Virtual Try-On',
    subtitle: 'See how outfits look on you before you wear them with our AI-powered try-on.',
    iconName: 'body-outline' as const,
  },
  {
    id: '4',
    title: 'Share Your Style',
    subtitle: 'Generate captions and styled cards to share your favorite looks on social media.',
    iconName: 'share-social-outline' as const,
  },
];
