import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { TagChip } from "../design-system/TagChip";
import { GlassCard } from "../design-system/GlassCard";
import { BottomTabBar } from "../design-system/BottomTabBar";
import { StatusBar } from "../design-system/StatusBar";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const categories = ["All", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"];

const wardrobeItems = [
  { 
    id: 1, 
    name: "White Tee", 
    category: "Tops", 
    worn: 12,
    image: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "Everlane"
  },
  { 
    id: 2, 
    name: "Black Jeans", 
    category: "Bottoms", 
    worn: 8,
    image: "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "Levi's"
  },
  { 
    id: 3, 
    name: "Summer Dress", 
    category: "Dresses", 
    worn: 3,
    image: "https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "Zara"
  },
  { 
    id: 4, 
    name: "Sneakers", 
    category: "Shoes", 
    worn: 15,
    image: "https://images.unsplash.com/photo-1650320079970-b4ee8f0dae33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "Nike"
  },
  { 
    id: 5, 
    name: "Leather Jacket", 
    category: "Tops", 
    worn: 5,
    image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "AllSaints"
  },
  { 
    id: 6, 
    name: "Denim Jacket", 
    category: "Tops", 
    worn: 2,
    image: "https://images.unsplash.com/photo-1770825491966-7b9c3124edad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "Gap"
  },
  { 
    id: 7, 
    name: "Casual Outfit", 
    category: "Tops", 
    worn: 4,
    image: "https://images.unsplash.com/photo-1687825520757-daf83926a93e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "H&M"
  },
  { 
    id: 8, 
    name: "Minimal Look", 
    category: "Tops", 
    worn: 6,
    image: "https://images.unsplash.com/photo-1761896902115-49793a359daf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    brand: "COS"
  },
];

export function WardrobeScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const filteredItems = activeCategory === "All" 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === activeCategory);

  return (
    <div className="mobile-container relative overflow-hidden pb-32">
      <StatusBar />
      <div className="safe-area-top px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Wardrobe</h1>
              <p className="text-gray-600">{wardrobeItems.length} items total</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center border border-violet-200"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center border border-violet-200"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <input
                  type="text"
                  placeholder="Search your wardrobe..."
                  className="w-full px-4 py-3 rounded-2xl glass-card border-2 border-violet-200 focus:border-[#6E4AE0] outline-none text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-6 px-6 scrollbar-hide">
          {categories.map((category) => (
            <TagChip
              key={category}
              label={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>

        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="text-center py-3">
            <div className="text-2xl font-bold text-[#6E4AE0]">{filteredItems.length}</div>
            <div className="text-xs text-gray-600">Items</div>
          </GlassCard>
          <GlassCard className="text-center py-3">
            <div className="text-2xl font-bold text-[#00C9B7]">
              {filteredItems.reduce((sum, item) => sum + item.worn, 0)}
            </div>
            <div className="text-xs text-gray-600">Times Worn</div>
          </GlassCard>
          <GlassCard className="text-center py-3">
            <div className="text-2xl font-bold text-[#E879F9]">
              {new Set(filteredItems.map(i => i.brand)).size}
            </div>
            <div className="text-xs text-gray-600">Brands</div>
          </GlassCard>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 gap-4 pb-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <GlassCard 
                hoverable 
                className="cursor-pointer overflow-hidden border border-violet-100"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-violet-50 to-purple-50">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <motion.div 
                    className="absolute top-2 right-2 glass-card-subtle px-2 py-1 rounded-full text-xs font-medium"
                    whileHover={{ scale: 1.1 }}
                  >
                    Worn {item.worn}x
                  </motion.div>
                  {item.worn > 10 && (
                    <div className="absolute top-2 left-2 bg-[#00C9B7] text-white px-2 py-1 rounded-full text-xs font-medium">
                      ⭐ Favorite
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.category}</span>
                    <span className="text-xs text-violet-600 font-medium">{item.brand}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/add-item")}
        className="fixed bottom-32 right-8 w-16 h-16 rounded-full gradient-pill border-glow shadow-2xl flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8 text-white" />
      </motion.button>

      <BottomTabBar />
    </div>
  );
}
