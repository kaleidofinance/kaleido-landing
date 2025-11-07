import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true
}) => {
  return (
    <motion.div
      className={`
        relative rounded-2xl p-6 overflow-hidden
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(0, 221, 114, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
      }}
      whileHover={hover ? {
        scale: 1.03,
        boxShadow: `
          0 25px 50px rgba(0, 221, 114, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `,
        borderColor: 'rgba(0, 221, 114, 0.5)',
        background: 'rgba(255, 255, 255, 0.08)',
        transition: { duration: 0.3, ease: "easeOut" }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glass highlight effect - top edge */}
      <div 
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{ zIndex: 1 }}
      />
      
      {/* Inner glow gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(0, 221, 114, 0.15) 0%, transparent 50%)',
          zIndex: 0,
        }}
        initial={{ opacity: 0.3 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />

      {/* Animated border glow */}
      {hover && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            border: '1px solid rgba(0, 221, 114, 0)',
            zIndex: 1,
          }}
          whileHover={{
            borderColor: 'rgba(0, 221, 114, 0.6)',
            boxShadow: '0 0 30px rgba(0, 221, 114, 0.4)',
            transition: { duration: 0.3 }
          }}
        />
      )}

      {/* Subtle background animation on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 221, 114, 0.05) 0%, rgba(0, 255, 34, 0.05) 100%)',
          zIndex: 0,
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Enhanced inner shadow for depth */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 -2px 4px rgba(255, 255, 255, 0.05)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
