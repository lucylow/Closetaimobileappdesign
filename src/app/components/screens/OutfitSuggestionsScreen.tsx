import { useState } from "react";
import { Cloud, Sun, Heart, Zap, TrendingUp } from "lucide-react";
import { TagChip } from "../design-system/TagChip";
import { GlassCard } from "../design-system/GlassCard";
import { BottomTabBar } from "../design-system/BottomTabBar";
import { StatusBar } from "../design-system/StatusBar";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const occasions = ["All", "Casual", "Work", "Date", "Party", "Sport"];

const outfitSuggestions = [
  {
    id: 1,
    title: "Casual Coffee Run",
    description: "Perfect for a relaxed weekend brunch",
    mainImage: "https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
    items: [
      { image: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
    ],
    tags: ["Casual", "Comfortable"],
    matchScore: 98,
    liked: false,
  },
  {
    id: 2,
    title: "Professional Meeting",
    description: "Sharp and polished for the boardroom",
    mainImage: "https://images.unsplash.com/photo-1769816377787-4694d3dacb18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
    items: [
      { image: "https://images.unsplash.com/photo-1560253717-c9ece454f7d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
    ],
    tags: ["Work", "Formal"],
    matchScore: 95,
    liked: true,
  },
  {
    id: 3,
    title: "Brunch Date",
    description: "Effortlessly chic and Instagram-ready",
    mainImage: "https://images.unsplash.com/photo-1765529374948-1180fd9375a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
    items: [
      { image: "https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
    ],
    tags: ["Date", "Stylish"],
    matchScore: 92,
    liked: false,
  },
  {
    id: 4,
    title: "Gym Session",
    description: "Performance meets style",
    mainImage: "https://images.unsplash.com/photo-1768929096134-f45af7839e83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
    items: [
      { image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
      { image: "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
    ],
    tags: ["Sport", "Active"],
    matchScore: 89,
    liked: false,
  },
];

export function OutfitSuggestionsScreen() {
  const [activeOccasion, setActiveOccasion] = useState("All");
  const [likedOutfits, setLikedOutfits] = useState<number[]>([2]);
  const navigate = useNavigate();

  const toggleLike = (id: number) => {
    setLikedOutfits(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="mobile-container relative overflow-hidden pb-32">
      <StatusBar />
      <div className="safe-area-top px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Outfit Ideas</h1>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00C9B7]" />
            <p className="text-gray-600">Styled just for you</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3 mb-6">
          {/* Occasion Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {occasions.map((occasion) => (
              <TagChip
                key={occasion}
                label={occasion}
                active={activeOccasion === occasion}
                onClick={() => setActiveOccasion(occasion)}
              />
            ))}
          </div>

          {/* Quick Stats */}
          <motion.div 
            className="glass-card rounded-2xl p-3 flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-700">72°F Sunny</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00C9B7]" />
              <span className="text-sm font-medium text-gray-700">{outfitSuggestions.length} matches</span>
            </div>
          </motion.div>
        </div>

        {/* Outfit Cards */}
        <div className="space-y-4 pb-6">
          {outfitSuggestions.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="border-glow overflow-hidden border border-violet-100">
                {/* Main Outfit Image */}
                <motion.div 
                  className="relative -m-4 mb-4 aspect-[4/3] overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate("/try-on")}
                >
                  <ImageWithFallback
                    src={outfit.mainImage}
                    alt={outfit.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Match Score */}
                  <motion.div 
                    className="absolute top-4 right-4 glass-card-subtle px-3 py-1.5 rounded-full flex items-center gap-1.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#00C9B7]" fill="#00C9B7" />
                    <span className="text-sm font-bold text-gray-900">{outfit.matchScore}%</span>
                  </motion.div>

                  {/* Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(outfit.id);
                    }}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full glass-card-subtle flex items-center justify-center"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        likedOutfits.includes(outfit.id)
                          ? "fill-[#E879F9] text-[#E879F9] scale-110"
                          : "text-gray-600"
                      }`}
                    />
                  </motion.button>

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-white text-xl mb-1">
                      {outfit.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {outfit.description}
                    </p>
                  </div>
                </motion.div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {outfit.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Item Thumbnails */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                  {outfit.items.map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, y: -4 }}
                      className="flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 border-violet-200 cursor-pointer"
                    >
                      <ImageWithFallback
                        src={item.image}
                        alt={`Item ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                  <div className="flex-shrink-0 w-16 h-20 rounded-xl bg-violet-50 border-2 border-dashed border-violet-300 flex items-center justify-center text-violet-400 text-xs font-medium">
                    +{outfit.items.length}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/try-on")}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#6E4AE0] to-[#A78BFA] text-white font-semibold shadow-lg"
                  >
                    Try On
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3.5 rounded-2xl glass-card-subtle font-semibold text-gray-700 border-2 border-violet-200"
                  >
                    Why?
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
