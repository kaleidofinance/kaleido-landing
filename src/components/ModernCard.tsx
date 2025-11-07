import React from "react";
import { motion } from "framer-motion";

interface ModernCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  bullets: string[];
  bg?: string;
}

const ModernCard: React.FC<ModernCardProps> = ({ icon: Icon, title, bullets, bg }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(0,221,114,0.16)' }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      className={`flex flex-col items-center text-center p-8 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg ${bg || 'bg-[#131317]'} group`}
    >
      <div className="p-4 rounded-full bg-gradient-to-br from-[#00dd72] to-[#22ff9a] mb-4 group-hover:from-[#22ff9a] group-hover:to-[#00dd72] transition-all duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <ul className="text-gray-300 text-left space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 w-2 h-2 bg-[#00dd72] rounded-full inline-block" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ModernCard;
