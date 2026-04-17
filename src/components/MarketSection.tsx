"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const MarketSection: React.FC = () => {
    return (
        <motion.div
            className="bg-[#080b09] flex flex-col items-center text-center px-4 relative pt-16 pb-4 w-full overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
        >
            {/* Section Label */}
            <motion.div
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
            >
                <span className="h-px w-5 bg-[#00ff99]/40" />
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#00ff99]">Supported Assets</span>
                <span className="h-px w-5 bg-[#00ff99]/40" />
            </motion.div>

            {/* Heading */}
            <motion.h2
                className="text-white mb-3 z-10 max-w-[500px] font-bold ss:text-[38px] text-[28px] ss:leading-[44px] leading-[32px] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                viewport={{ once: true }}
            >
                Natively <span className="bg-gradient-to-r from-[#00ff99] to-[#00dd72] bg-clip-text text-transparent">integrated</span> across the OS
            </motion.h2>

            <motion.p
                className="text-white/40 text-sm max-w-sm mb-6 z-10 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                viewport={{ once: true }}
            >
                Every asset is fully composable across Lending, DEX, Staking, and the kfUSD Vault — powered by Luca's routing engine.
            </motion.p>

            {/* CTA Button */}
            <motion.div
                className="mb-12 z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                viewport={{ once: true }}
            >
                <a
                    href="https://app.kaleidofinance.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#00ff99] text-black text-sm font-bold hover:bg-[#00ff99]/90 transition-all duration-200 shadow-[0_0_25px_rgba(0,255,153,0.3)] hover:shadow-[0_0_40px_rgba(0,255,153,0.5)] group"
                >
                    Launch App
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div
                className="absolute top-0 md:top-6 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-30"
                animate={{ opacity: [0.3, 0.5, 0.3], y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
            >
                <Image
                    src="/Switch.svg"
                    alt="Switch"
                    width={500}
                    height={300}
                    className="w-full h-auto grayscale opacity-50"
                />
            </motion.div>

            <motion.div
                className="absolute md:top-24 lgg:top-28 top-10 left-0 w-24 h-24 sm:w-32 md:w-[12rem] sm:h-32 z-10 opacity-30"
                animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
            >
                <Image
                    src="/AssetSelector.svg"
                    alt="Asset Selector"
                    width={500}
                    height={300}
                    className="w-full h-auto grayscale opacity-50"
                />
            </motion.div>

            {/* Asset Grid Image */}
            <motion.div
                className="w-full max-w-[540px] sm:mt-10 mt-4 mb-8 z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <Image
                    src="/CryptoAssets.svg"
                    alt="Supported crypto assets on Kaleido Agentic OS"
                    width={500}
                    height={300}
                    className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,255,153,0.1)]"
                />
            </motion.div>

            {/* Background glow effects */}
            <motion.div className="absolute z-[1] w-36 sm:w-[400px] h-[40%] rounded-3xl bg-gradient-to-br from-[#00ff99]/5 to-[#00dd72]/5 top-24 left-4"
                animate={{ opacity: [0.5, 1, 0.5], y: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div className="absolute z-[0] w-24 sm:w-[200px] h-[20%] rounded-3xl bg-gradient-to-br from-[#00ff99]/5 to-[#00dd72]/5 top-36 left-0"
                animate={{ opacity: [0.4, 0.8, 0.4], x: [0, 20, 0] }}
                transition={{ duration: 9, repeat: Infinity }}
            />
            <motion.div className="absolute z-[0] w-10 sm:w-[400px] md:h-[300px] h-10 rounded-xl bg-gradient-to-br from-[#00dd72]/5 to-[#00ff99]/5 top-36 left-0"
                animate={{ opacity: [0.3, 0.7, 0.3], y: [0, 15, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
            />
            <div className="absolute w-full -bottom-9 h-[500px] bg-gradient-to-b from-[#080b09] to-transparent z-[0]" />
        </motion.div>
    );
};

export default MarketSection;
