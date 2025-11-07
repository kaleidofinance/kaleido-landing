"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GlowButton } from './GlowButton';

const MarketSection: React.FC = () => {
    return (
        <motion.div
            className="bg-[#111714] flex flex-col items-center text-center px-4 relative pt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
        >
            {/* Market Label */}
            <motion.div
                className="text-xs text-gray-300 uppercase tracking-wide mb-4 bg-[#111714]/60 border border-[#00dd72]/30 py-3 px-4 rounded-3xl"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                Market
            </motion.div>

            {/* Popular Heading */}
            <motion.h2
                className="text-white mb-8 z-10 max-w-[520px] font-bold ss:text-[48px] text-[32px] ss:leading-[48px] leading-[32px]"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                Most <span className="text-[#00dd72]">popular</span> integrated assets
            </motion.h2>

            {/* Visit Marketplace Button */}
            <motion.div
                className="mb-12 z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <GlowButton 
                    size="lg" 
                    className="group flex items-center"
                    onClick={() => window.open('https://app.kaleidofinance.xyz/', '_blank')}
                >
                    Visit Marketplace
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlowButton>
            </motion.div>

            <motion.div
                className="absolute top-0 md:top-6 right-0 w-32 h-32 sm:w-48 sm:h-48"
                animate={{ opacity: [0.7, 1, 0.7], y: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
            >
                <Image
                    src="/Switch.svg"
                    alt="Switch"
                    width={500}
                    height={300}
                    className="w-full h-auto"
                />
            </motion.div>

            <motion.div
                className="absolute md:top-24 lgg:top-28 top-10 left-0 w-32 h-32 sm:w-48 md:w-[16rem] sm:h-48 z-10"
                animate={{ opacity: [0.5, 1, 0.5], y: [0, -20, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
            >
                <Image
                    src="/AssetSelector.svg"
                    alt="Asset Selector"
                    width={500}
                    height={300}
                    className="w-full h-auto"
                />
            </motion.div>

            {/* Bottom Single Grid Image */}
            <motion.div
                className="w-full max-w-[824px] sm:mt-12 mt-4 mb-8 z-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <Image
                    src="/CryptoAssets.svg"
                    alt="Crypto Assets"
                    width={500}
                    height={300}
                    className="w-full h-auto"
                />
            </motion.div>

            <motion.div className="absolute z-[1] w-36 sm:w-[400px] h-[40%] rounded-3xl bg-gradient-to-br from-[#00dd72]/5 to-[#00ff22]/5 top-24 left-4"
                animate={{ opacity: [0.5, 1, 0.5], y: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div className="absolute z-[0] w-24 sm:w-[200px] h-[20%] rounded-3xl bg-gradient-to-br from-[#00dd72]/5 to-[#00dd72]/5 top-36 left-0"
                animate={{ opacity: [0.4, 0.8, 0.4], x: [0, 20, 0] }}
                transition={{ duration: 9, repeat: Infinity }}
            />
            <motion.div className="absolute z-[0] w-10 sm:w-[400px] md:h-[300px] h-10 rounded-xl bg-gradient-to-br from-[#00ff22]/5 to-[#00dd72]/5 top-36 left-0"
                animate={{ opacity: [0.3, 0.7, 0.3], y: [0, 15, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
            />
            <div className="absolute w-full -bottom-9 h-[500px] bg-gradient-to-b from-[#111714] to-transparent z-[0]" />
        </motion.div>
    );
};

export default MarketSection;
