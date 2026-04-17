"use client";

import { motion } from "framer-motion";
import CardDetails from "@/components/CardDetails";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import AiSection from "@/components/AiSection";
import DeFiEcosystem from "@/components/DeFiEcosystem";

import HowToBuy from "@/components/HowToBuy";
import MarketSection from "@/components/MarketSection";
import FinalSection from "@/components/FinalSection";
import Footer from "@/components/Footer";
import PointEconomy from "@/components/PointEconomy";

export default function Home() {
 
  
  return (
    <div className="w-full overflow-hidden bg-[#080b09] relative">
      {/* Subtle Background Glow — barely visible, deep space aesthetic */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Single subtle orb - top left */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[160px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 153, 0.03) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Single subtle orb - bottom right */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 153, 0.02) 0%, transparent 70%)',
            bottom: '20%',
            right: '15%',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Navbar is now fixed/sticky — renders itself */}
        <Navbar />

        {/* Hero */}
        <Hero />

        {/* DeFi Ecosystem */}
        <div className="md:max-w-[94%] m-auto">
          <div className="px-6 flex justify-center items-center">
            <div className="xl:max-w-[1440px] w-full">
              <DeFiEcosystem />
            </div>
          </div>
        </div>

        <HowToBuy />
        <FeatureCardGrid />
        <AiSection />
        <PointEconomy />

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
