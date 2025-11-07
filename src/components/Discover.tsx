"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Shield,
  Coins,
  BarChart3,
  TrendingUp,
  Brain,
  Zap,
  DollarSign,
  Rocket,
  Layers
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const Discover = () => {
  return (
    <motion.section
      className="pt-12 pb-20 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl font-bold mb-4 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            Discover the Complete{' '}
            <motion.span
              className="text-[#00dd72]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Kaleido Finance
            </motion.span>{' '}
            Ecosystem
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            Everything you need for DeFi in one unified platform
          </motion.p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
        >
          <FeatureCard
            icon={Layers}
            title="Modular Architecture"
            description="Built with Diamond Standard for seamless upgrades and feature additions"
          />
          <FeatureCard
            icon={Globe}
            title="Multi-Chain Support"
            description="Deploy on Abstract, Arbitrum, Polygon, Base, and Ethereum with unified UX"
          />
          <FeatureCard
            icon={Shield}
            title="Enterprise Security"
            description="Audited smart contracts with comprehensive security measures and protection"
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Discover;
