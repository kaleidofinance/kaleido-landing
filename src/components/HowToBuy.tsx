"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const HowToBuy: React.FC = () => {
    // Animation variants for steps
    const containerVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.18 }
        }
    };
    const stepVariants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.6 } }
    };

    return (
        <section className="py-20 px-8 sm:px-12 lg:px-16 xl:px-20 bg-black/40">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 text-white">Simple 3-Step Process</h2>
                    <p className="text-xl text-gray-300 mb-2">Get Started with Kaleido Finance</p>
                    <p className="text-[#00dd72] font-semibold">Access All DeFi Products in One Platform</p>
                </div>
                
                <motion.div
                    className="flex flex-col md:flex-row justify-center items-center space-y-12 md:space-y-0 md:space-x-16"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {/* Step 1: Connect Wallet */}
                    <motion.div 
                        className="flex flex-col items-center text-center relative"
                        variants={stepVariants}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="relative">
                            <motion.div 
                                className="flex items-center justify-center mb-4"
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Image
                                    src="/wallet.png"
                                    alt="Connect Wallet"
                                    width={80}
                                    height={80}
                                    priority
                                    className="object-contain"
                                />
                            </motion.div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00dd72] text-black text-xs font-bold flex items-center justify-center">
                                1
                            </div>
                        </div>
                        
                        <div className="hidden md:block absolute top-12 left-full w-32 h-0.5 bg-gradient-to-r from-[#00dd72] to-transparent"></div>
                        
                        <h3 className="text-lg font-bold text-white mb-2">Connect Wallet</h3>
                        <p className="text-gray-300 text-sm max-w-xs">Link your Web3 wallet securely to the platform</p>
                    </motion.div>

                    {/* Step 2: Choose Product */}
                    <motion.div 
                        className="flex flex-col items-center text-center relative"
                        variants={stepVariants}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="relative">
                            <motion.div 
                                className="flex items-center justify-center mb-4"
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ duration: 2.2, repeat: Infinity }}
                            >
                                <Image
                                    src="/deposit.png"
                                    alt="Choose Product"
                                    width={80}
                                    height={80}
                                    priority
                                    className="object-contain"
                                />
                            </motion.div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00dd72] text-black text-xs font-bold flex items-center justify-center">
                                2
                            </div>
                        </div>
                        
                        <div className="hidden md:block absolute top-12 left-full w-32 h-0.5 bg-gradient-to-r from-[#00dd72] to-transparent"></div>
                        
                        <h3 className="text-lg font-bold text-white mb-2">Choose Product</h3>
                        <p className="text-gray-300 text-sm max-w-xs">Select from lending, trading, staking, stablecoins, or launchpad</p>
                    </motion.div>

                    {/* Step 3: Start Earning */}
                    <motion.div 
                        className="flex flex-col items-center text-center relative"
                        variants={stepVariants}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="relative">
                            <motion.div 
                                className="flex items-center justify-center mb-4"
                                animate={{ y: [0, -5, 0] }} 
                                transition={{ duration: 2.4, repeat: Infinity }}
                            >
                                <Image
                                    src="/transact.png"
                                    alt="Start Earning"
                                    width={80}
                                    height={80}
                                    priority
                                    className="object-contain"
                                />
                            </motion.div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00dd72] text-black text-xs font-bold flex items-center justify-center">
                                3
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-2">Start Earning</h3>
                        <p className="text-gray-300 text-sm max-w-xs">Begin trading, lending, staking, or exploring opportunities</p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default HowToBuy;
