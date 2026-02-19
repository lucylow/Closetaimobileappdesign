import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="mobile-container fixed inset-0 bg-gradient-to-br from-[#F8F9FF] via-[#EEF0FF] to-[#F8F9FF] flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#6E4AE0] to-[#E879F9] flex items-center justify-center shadow-2xl"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          ClosetAI
        </motion.h2>
        
        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="text-gray-600"
        >
          Your AI Wardrobe Stylist
        </motion.p>
      </motion.div>
    </div>
  );
}
