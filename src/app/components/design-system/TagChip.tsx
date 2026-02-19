import { motion } from "motion/react";

interface TagChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function TagChip({ label, active = false, onClick }: TagChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-200
        ${active 
          ? 'bg-[#00C9B7] text-white border-glow-teal' 
          : 'bg-white/60 text-gray-700 border border-gray-200'
        }
      `}
    >
      {label}
    </motion.button>
  );
}
