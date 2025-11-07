import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Roadmap = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const roadmapData = [
    {
      period: "Q2/Q3 2025",
      title: "2025",
      items: [
        "Beta Testnet Release",
        "Key Partnerships (Audit/Advisory/CEX)",
        "Seed Round Finalize",
        "IDO Public Sale",
        "Tokenomics Release",
        "Mubeen Genesis Release",
        "Audit Completion",
        "TGE Events",
        "Initial DEX/CEX Listings"
      ]
    },
    {
      period: "Q3 2025",
      title: "Q3 2025",
      items: [
        "Beta Mainnet Launch",
        "Full Mainnet Launch with AI integration",
        "User Growth Campaigns"
      ]
    },
    {
      period: "Q4 2025",
      title: "Q4 2025",
      items: [
        "Launch New Lending Pools",
        "Kaleido's Native Swap Launch",
        "Kaleido's Built-in IDO Launchpad",
        "AI Agent (Luca) Release",
        "Token Utility Growth"
      ]
    },
    {
      period: "2026",
      title: "Future Expansion",
      items: [
        "Cross-Chain Capabilities",
        "Achieve Significant Market Share",
        "Protocol Governance via DAO Release",
        "New DeFi Primitives",
        "Expand AI Features",
        "Token Utility Growth"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const dotVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="bg-black text-white py-20 px-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Center dim green with radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,#00dd7210_0%,#00dd7205_50%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative px-8 md:px-16 lg:px-24">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#00dd72] to-[#00dd72] bg-clip-text text-transparent"
        >
          Roadmap
        </motion.h2>

        <motion.div 
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Timeline items */}
          <div className="space-y-32">
            {roadmapData.map((phase, index) => (
              <motion.div 
                key={index} 
                className="relative"
                variants={itemVariants}
              >
                {/* Timeline dot */}
                <motion.div 
                  className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-[#00dd72] shadow-lg shadow-[#00dd72]/20 cursor-pointer z-10 ${
                    activeIndex === index ? 'animate-pulse' : ''
                  }`}
                  variants={dotVariants}
                  onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="absolute inset-0 rounded-full bg-[#00dd72] animate-ping opacity-75"></div>
                </motion.div>
                
                <div className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center gap-8`}>
                  {/* Empty space for layout balance */}
                  <div className="w-1/2"></div>
                  
                  {/* Content */}
                  <motion.div 
                    className={`w-1/2 bg-[#111111] rounded-2xl border ${
                      activeIndex === index 
                        ? 'border-[#00dd72] shadow-[0_0_20px_rgba(0,221,114,0.2)]' 
                        : 'border-[#00dd72]/20'
                    } overflow-hidden relative`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {/* Card Header */}
                    <div 
                      className="p-6 cursor-pointer flex items-center justify-between relative"
                      onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                    >
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#00dd72]">{phase.period}</h3>
                        <h4 className="text-lg font-semibold text-gray-300">{phase.title}</h4>
                      </div>
                      <motion.div
                        animate={{ rotate: activeIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`ml-4 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          activeIndex === index 
                            ? 'border-[#00dd72] text-[#00dd72]' 
                            : 'border-[#00dd72]/20 text-gray-400'
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.div>
                    </div>

                    {/* Card Content */}
                    <AnimatePresence>
                      {activeIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 border-t border-[#00dd72]/20">
                            <ul className="space-y-4">
                              {phase.items.map((item, itemIndex) => (
                                <motion.li 
                                  key={itemIndex} 
                                  className="flex items-start gap-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: itemIndex * 0.1 }}
                                >
                                  <span className="text-[#00dd72] mt-1.5">
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="4" cy="4" r="4" fill="currentColor"/>
                                    </svg>
                                  </span>
                                  <span className="text-gray-300 hover:text-white transition-colors duration-300">{item}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Roadmap; 