import { useState } from "react";
import { Camera, ChevronLeft, Check, Sparkles } from "lucide-react";
import { PrimaryButton } from "../design-system/PrimaryButton";
import { TagChip } from "../design-system/TagChip";
import { StatusBar } from "../design-system/StatusBar";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const categories = ["Tops", "Bottoms", "Dresses", "Shoes", "Accessories", "Outerwear"];
const colors = [
  { name: "Black", hex: "#1F2937" },
  { name: "White", hex: "#F9FAFB" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Yellow", hex: "#F59E0B" },
];

const sampleImages = [
  "https://images.unsplash.com/photo-1722310752951-4d459d28c678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
];

export function AddItemScreen() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePhotoCapture = () => {
    setPhotoTaken(true);
    // Auto-advance after photo is taken
    setTimeout(() => setStep(2), 800);
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigate("/wardrobe");
    }, 1500);
  };

  return (
    <div className="mobile-container relative overflow-hidden bg-gradient-to-br from-[#F8F9FF] to-[#EEF0FF]">
      <StatusBar />
      <div className="safe-area-top h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-100">
          <motion.button 
            onClick={() => navigate(-1)} 
            className="p-2 glass-card rounded-full"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">Add Item</h1>
          <div className="w-10" />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 px-6 py-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div 
                animate={{
                  scale: step >= s ? 1 : 0.8,
                  backgroundColor: step >= s ? "#6E4AE0" : "#E5E7EB"
                }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step >= s ? 'text-white shadow-lg' : 'text-gray-500'}
                `}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </motion.div>
              {s < 3 && (
                <motion.div 
                  animate={{
                    backgroundColor: step > s ? "#6E4AE0" : "#E5E7EB"
                  }}
                  className="w-16 h-1 rounded"
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add a Photo</h2>
                  <p className="text-gray-600">Take or upload a photo of your item</p>
                </div>

                <motion.button
                  whileHover={{ scale: photoTaken ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePhotoCapture}
                  className="w-full aspect-[3/4] rounded-3xl overflow-hidden relative"
                >
                  <AnimatePresence mode="wait">
                    {!photoTaken ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="w-full h-full border-4 border-dashed border-violet-300 bg-violet-50 flex flex-col items-center justify-center gap-4"
                      >
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6E4AE0] to-[#A78BFA] flex items-center justify-center shadow-2xl"
                        >
                          <Camera className="w-12 h-12 text-white" />
                        </motion.div>
                        <span className="text-violet-700 font-semibold text-lg">Tap to add photo</span>
                        <span className="text-violet-600 text-sm">Camera or Gallery</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="photo"
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full"
                      >
                        <ImageWithFallback
                          src={sampleImages[selectedImage]}
                          alt="Captured item"
                          className="w-full h-full object-cover"
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-[#00C9B7] flex items-center justify-center shadow-xl"
                        >
                          <Check className="w-7 h-7 text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {photoTaken && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 justify-center"
                  >
                    {sampleImages.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-20 rounded-xl overflow-hidden ${
                          selectedImage === idx ? 'ring-4 ring-[#00C9B7]' : 'opacity-50'
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`Option ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Details</h2>
                  <p className="text-gray-600">Tell us about this piece</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Item Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g., White Cotton T-Shirt"
                      className="w-full px-4 py-4 rounded-2xl glass-card border-2 border-violet-200 focus:border-[#6E4AE0] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <TagChip
                          key={cat}
                          label={cat}
                          active={selectedCategory === cat}
                          onClick={() => setSelectedCategory(cat)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Primary Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => (
                        <motion.button
                          key={color.name}
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setSelectedColor(color.name)}
                          className="relative group"
                        >
                          <div
                            className={`
                              w-14 h-14 rounded-2xl transition-all shadow-md
                              ${selectedColor === color.name ? 'ring-4 ring-[#00C9B7] scale-110' : 'hover:scale-105'}
                            `}
                            style={{ 
                              backgroundColor: color.hex,
                              border: color.hex === '#F9FAFB' ? '2px solid #E5E7EB' : 'none'
                            }}
                          />
                          {selectedColor === color.name && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check className="w-6 h-6 text-white drop-shadow-lg" />
                            </motion.div>
                          )}
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {color.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand (Optional)
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g., Nike, Zara, H&M"
                      className="w-full px-4 py-4 rounded-2xl glass-card border-2 border-gray-200 focus:border-[#6E4AE0] outline-none transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Save</h2>
                  </motion.div>
                  <p className="text-gray-600">Everything look good?</p>
                </div>

                <motion.div 
                  className="glass-card rounded-3xl p-6 space-y-4 border-2 border-violet-200"
                  whileHover={{ y: -4 }}
                >
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden relative">
                    <ImageWithFallback
                      src={sampleImages[selectedImage]}
                      alt={itemName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="font-bold text-white text-xl mb-1">
                          {itemName || "New Item"}
                        </h3>
                        <p className="text-white/90">{selectedCategory || "Category"}</p>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedColor && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-2 rounded-xl bg-violet-100 text-violet-700 text-sm font-medium"
                      >
                        {selectedColor}
                      </motion.span>
                    )}
                    {brand && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="px-3 py-2 rounded-xl bg-teal-100 text-teal-700 text-sm font-medium"
                      >
                        {brand}
                      </motion.span>
                    )}
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-3 py-2 rounded-xl bg-pink-100 text-pink-700 text-sm font-medium"
                    >
                      Never worn
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="p-6 safe-area-bottom border-t border-violet-100 bg-gradient-to-t from-white to-transparent">
          <PrimaryButton
            fullWidth
            onClick={() => step === 3 ? handleSave() : setStep(step + 1)}
            disabled={step === 1 && !photoTaken}
          >
            {step === 3 ? (
              <>
                <Sparkles className="w-5 h-5" />
                Save to Closet
              </>
            ) : (
              "Continue"
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="glass-card rounded-3xl p-8 m-6 text-center border-2 border-[#00C9B7]"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#00C9B7] flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">Item added to your wardrobe</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
