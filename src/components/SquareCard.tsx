import React, { useRef } from "react";
import { motion } from "framer-motion";

const SquareCard = ({ image, title, description, CSS }: any) => {
    const textColor = CSS === "bg-white" ? "text-[#111218]" : "text-[#C8C9D0]";
    const paddingClass = image === "/vector.svg" ? "px-8" : "pl-8";
    const cardRef = useRef<HTMLDivElement>(null);

    // Ripple effect
    const handleRipple = (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const circle = document.createElement("span");
      const diameter = Math.max(card.clientWidth, card.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - card.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${e.clientY - card.getBoundingClientRect().top - radius}px`;
      circle.className = "absolute bg-white/20 rounded-full pointer-events-none animate-ripple";
      card.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    };

  return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(0,221,114,0.2)' }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className={`flex-shrink-0 w-[300px] max-h-[380px] py-6 ${paddingClass} rounded-xl z-20 ${CSS || "bg-[#111218]"} flex flex-col justify-between relative mx-4 bg-white/10 backdrop-blur-lg border border-white/10 overflow-hidden cursor-pointer group`}
        onClick={handleRipple}
      >
      {/* Image with default width and controlled height */}
      <img
        src={image}
        alt={title}
        className="w-full h-auto object-contain"
      />

      {/* Text container */}
      <div className="absolute bottom-6">
        <h2 className={`text-lg font-normal ${textColor}`}>{title}</h2>
        <p className={`mt-1 text-sm ${textColor === "text-[#111218]" ? "text-[#9C9EAB]" : "text-[#868898]"} font-medium`}>
          {description}
        </p>
      </div>
      </motion.div>
  );
};

export default SquareCard;

// Add ripple animation to globals.css:
// .animate-ripple {
//   animation: ripple 0.6s linear;
// }
// @keyframes ripple {
//   to {
//     transform: scale(2);
//     opacity: 0;
//   }
// }
