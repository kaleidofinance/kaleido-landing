"use client";

import { motion } from "framer-motion";
import CardDetails from "@/components/CardDetails";
import Discover from "@/components/Discover";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import AiSection from "@/components/AiSection";

import HowToBuy from "@/components/HowToBuy";
import MarketSection from "@/components/MarketSection";
import FinalSection from "@/components/FinalSection";
import Footer from "@/components/Footer";

export default function Home() {
 
  
  return (
    <div className="w-full overflow-hidden bg-[#111714] relative">
      {/* Animated Background Glow Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Animated Orb 1 - Top Left */}
        <motion.div
          className="absolute w-96 h-96 bg-[#00dd72]/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            top: '25%',
            left: '25%',
          }}
        />
        
        {/* Animated Orb 2 - Bottom Right */}
        <motion.div
          className="absolute w-96 h-96 bg-[#00ff22]/5 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            bottom: '25%',
            right: '25%',
          }}
        />
        
        {/* Animated Orb 3 - Center */}
        <motion.div
          className="absolute w-[800px] h-[800px] bg-[#00dd72]/3 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Additional floating orbs */}
        <motion.div
          className="absolute w-64 h-64 bg-[#00ff22]/4 rounded-full blur-2xl"
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -100, 80, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            top: '15%',
            right: '20%',
          }}
        />
        
        <motion.div
          className="absolute w-72 h-72 bg-[#00dd72]/4 rounded-full blur-2xl"
          animate={{
            x: [0, -100, 60, 0],
            y: [0, 90, -70, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            bottom: '30%',
            left: '15%',
          }}
        />
        
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(0, 221, 114, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 255, 34, 0.08) 0%, transparent 50%)',
            opacity: 0.4,
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Moving gradient orb */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 221, 114, 0.1) 0%, transparent 70%)',
            top: '40%',
            left: '60%',
          }}
          animate={{
            x: [0, 200, -150, 0],
            y: [0, -150, 200, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="border-b border-[#808080]">
          <div className="md:max-w-[94%] m-auto">
            <div className="px-6 flex justify-center items-center">
              <div className="xl:max-w-[1440px] w-full">
                <Navbar />
              </div>
            </div>
          </div>
        </div>

      <div>
        <div className="hidden lg:block absolute w-full top-[4%] h-[700px] lgg:h-[750px] z-10 bg-gradient-to-b from-[#111714] to-transparent" />
        <div className="md:max-w-[94%] m-auto relative">
        <div className="px-6 flex justify-center items-start">
          <div className="xl:max-w-[1440px] w-full">
            <Hero />
          </div>
        </div>
        <div className="px-6 flex justify-center items-center">
          <div className="xl:max-w-[1440px] w-full">
            <Discover />
          </div>
        </div>
      </div>
      </div>

      <HowToBuy />

      <FeatureCardGrid />

      <AiSection />

      
      <div className="md:max-w-[94%] m-auto">
        <div className="px-6 flex justify-center items-center">
          <div className="xl:max-w-[1440px] w-full">
            <CardDetails />
          </div>
        </div>
      </div>

      <MarketSection />

      <FinalSection />

      <Footer />
      </div>
    </div>
  );
}
