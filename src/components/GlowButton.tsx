import React from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick
}) => {
  const baseClasses = "flex items-center justify-center font-bold rounded-lg transition-all duration-300 ease-out relative overflow-hidden gap-2";

  const variantClasses = {
    primary: "bg-[#00dd72] text-black hover:bg-[#00c868] shadow-lg shadow-[#00dd72]/20 hover:shadow-[#00dd72]/40",
    secondary: "bg-black hover:bg-[#00dd72] text-white border border-[#00dd72]/30 hover:border-[#00dd72]/60",
    outline: "bg-transparent border border-[#00dd72]/30 text-[#00dd72] hover:bg-[#00dd72]/10 hover:border-[#00dd72]/60"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm h-9",
    md: "px-4 py-2 text-base h-12",
    lg: "px-6 py-3 text-lg h-12"
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#00dd72]/0 via-[#00dd72]/20 to-[#00dd72]/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};
