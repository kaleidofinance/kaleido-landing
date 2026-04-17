"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FinalSection: React.FC = () => {
    return (
        <section className="relative py-32 px-6 md:px-10 overflow-hidden">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00ff99]/[0.02] rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                {/* Heading */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                        Enter the{' '}
                        <span className="bg-gradient-to-r from-[#00ff99] to-[#00dd72] bg-clip-text text-transparent">
                            Autonomous Layer
                        </span>
                    </h2>
                    <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
                        Deploy, Stake, and Reason. The Kaleido Agentic OS is live — and Luca is ready to execute.
                    </p>
                </motion.div>

                {/* Dashboard Preview */}
                <motion.div
                    className="relative mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    viewport={{ once: true }}
                >
                    {/* Background glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#00ff99]/[0.04] via-transparent to-[#00ff99]/[0.04] rounded-3xl blur-2xl pointer-events-none" />

                    {/* Frame */}
                    <div className="relative rounded-2xl border border-white/[0.06] bg-[#0a0f0c]/80 backdrop-blur-xl p-3 shadow-[0_0_80px_rgba(0,255,153,0.04)]">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 mb-3 px-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="h-5 rounded-md bg-white/[0.03] border border-white/[0.04] flex items-center px-3">
                                    <span className="text-[10px] text-white/20 font-mono">app.kaleido.xyz</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-pulse" />
                                <span className="text-[9px] text-[#00ff99] font-semibold">Live</span>
                            </div>
                        </div>

                        {/* Dashboard image */}
                        <div className="relative overflow-hidden rounded-xl">
                            <Image
                                src="/Dashboard.png"
                                alt="Kaleido Agentic OS Dashboard Interface"
                                width={1200}
                                height={600}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <a
                        href="https://app.kaleido.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-[#00ff99] text-black text-sm font-bold hover:bg-[#00ff99]/90 transition-all duration-200 shadow-[0_0_30px_rgba(0,255,153,0.3)] hover:shadow-[0_0_50px_rgba(0,255,153,0.5)] group"
                    >
                        Launch Kaleido Agentic OS
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalSection;
