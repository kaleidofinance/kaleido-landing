import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.9 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.6,
            type: 'spring',
            stiffness: 100,
            damping: 15
          }
        }
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="w-full"
    >
      <GlassCard className="group h-full">
        {/* Light sweep animation on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00dd72]/10 to-transparent rounded-2xl pointer-events-none z-0"
          initial={{ x: '-100%' }}
          whileHover={{ 
            x: '100%',
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
        />
        
        <div className="flex flex-col items-center text-center space-y-4 h-full relative z-10">
          <motion.div
            className="p-4 rounded-full bg-[#00dd72]/20 group-hover:bg-[#00dd72]/30 border border-[#00dd72]/30 transition-all duration-300 relative overflow-hidden"
            whileHover={{
              scale: 1.15,
              rotate: 5,
              transition: { 
                duration: 0.3,
                ease: "easeOut"
              }
            }}
          >
            {/* Pulsing glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#00dd72]/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Icon glow on hover */}
            <motion.div
              className="absolute inset-0 rounded-full bg-[#00dd72]/20"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{
                scale: 1.8,
                opacity: 0.4,
                transition: { duration: 0.3 }
              }}
            />
            <Icon className="w-8 h-8 text-[#00dd72] relative z-10" />
          </motion.div>

          <motion.h3
            className="text-xl font-bold text-white"
            initial={{ opacity: 0.9 }}
            whileHover={{ 
              scale: 1.05,
              opacity: 1,
              textShadow: "0 0 10px rgba(0, 221, 114, 0.3)"
            }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h3>

          <motion.p
            className="text-gray-300 leading-relaxed flex-grow"
            initial={{ opacity: 0.8 }}
            whileHover={{ 
              opacity: 1,
              y: -2
            }}
            transition={{ duration: 0.2 }}
          >
            {description}
          </motion.p>
        </div>
      </GlassCard>
    </motion.div>
  );
};
