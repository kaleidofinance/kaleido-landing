"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { GlowButton } from './GlowButton';

const FinalSection: React.FC = () => {
    return (
        <motion.div
            className="bg-[#111714] flex flex-col items-center text-center px-4 relative py-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.2 }}
        >
            {/* CTA Heading */}
            <motion.div
                className="mb-12 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                    Ready to Transform Your{' '}
                    <span className="bg-gradient-to-r from-[#00dd72] via-[#00dd72] to-[#00ff22] bg-clip-text text-transparent">
                        DeFi Experience
                    </span>
                    ?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                    Join thousands of users accessing lending, trading, staking, stablecoins, and more — all in one unified platform
                </p>
            </motion.div>

            {/* Modern Dashboard Showcase */}
            <motion.div
                className="relative mb-16 z-10 w-full max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                viewport={{ once: true, amount: 0.3 }}
            >
                {/* Background glow effects */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#00dd72]/10 via-[#00ff22]/5 to-[#00dd72]/10 rounded-3xl blur-2xl"></div>
                <div className="absolute -inset-2 bg-gradient-to-br from-[#00dd72]/5 to-[#00ff22]/5 rounded-2xl blur-xl"></div>
                
                {/* Glass container */}
                <div className="relative bg-[#111714]/80 backdrop-blur-sm border border-[#00dd72]/30 rounded-2xl p-8 shadow-2xl">
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-[#00dd72] to-[#00ff22] rounded-full animate-pulse border-2 border-black"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-[#00dd72] to-[#00dd72] rounded-full animate-bounce border-2 border-black"></div>
                    
                    {/* Dashboard image with modern frame */}
                    <div className="relative overflow-hidden rounded-xl border border-[#00dd72]/30 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00dd72]/5 to-transparent"></div>
                        <Image
                            src="/Dashboard.png"
                            alt="Kaleido Finance Dashboard Interface"
                            width={1200}
                            height={600}
                            className="w-full h-auto relative z-10 transition-transform duration-500 hover:scale-105"
                            priority
                        />
                        
                        {/* Overlay indicators */}
                        <div className="absolute top-4 left-4 flex space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-[#00dd72] rounded-full"></div>
                        </div>
                        
                        {/* Live indicator */}
                        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-[#111714]/70 backdrop-blur-sm rounded-full px-3 py-1 border border-[#00dd72]/30">
                            <div className="w-2 h-2 bg-[#00dd72] rounded-full animate-pulse"></div>
                            <span className="text-xs text-white font-medium">Live</span>
                        </div>
                    </div>
                    
                    {/* Info badges */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                        <div className="bg-[#00dd72]/20 backdrop-blur-sm border border-[#00dd72]/30 rounded-full px-4 py-2">
                            <span className="text-xs text-[#00dd72] font-semibold">Real-time Data</span>
                        </div>
                        <div className="bg-[#00ff22]/20 backdrop-blur-sm border border-[#00ff22]/30 rounded-full px-4 py-2">
                            <span className="text-xs text-[#00ff22] font-semibold">AI Powered</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
                className="z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                viewport={{ once: true, amount: 0.5 }}
            >
                <GlowButton 
                    size="lg" 
                    className="group flex items-center text-lg px-12 py-4"
                    onClick={() => window.open('https://app.kaleidofinance.xyz', '_blank')}
                >
                    <ExternalLink className="w-6 h-6 mr-3" />
                    Visit DApp
                    <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlowButton>
            </motion.div>
        </motion.div>
    );
};

export default FinalSection;

