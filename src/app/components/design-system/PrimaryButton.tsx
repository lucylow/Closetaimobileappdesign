import { motion } from "motion/react";
import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function PrimaryButton({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false,
  fullWidth = false,
  className = ""
}: PrimaryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-full px-8 py-4 
        font-semibold text-white gradient-pill border-glow
        button-press disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <div className="absolute inset-0 shimmer" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? "Loading..." : children}
      </span>
    </motion.button>
  );
}
