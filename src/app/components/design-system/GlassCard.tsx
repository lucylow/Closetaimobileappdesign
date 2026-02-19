import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function GlassCard({ children, className = "", onClick, hoverable = false }: GlassCardProps) {
  const Component = onClick || hoverable ? motion.div : 'div';
  
  return (
    <Component
      {...(onClick || hoverable ? {
        whileHover: { y: -2 },
        whileTap: onClick ? { scale: 0.98 } : undefined
      } : {})}
      onClick={onClick}
      className={`
        glass-card rounded-3xl p-4
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
