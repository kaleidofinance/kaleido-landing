import { motion } from 'framer-motion';
import { ExternalLink, Play, Grid3x3, Brain, Network } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { useState } from 'react';
import DemoModal from './DemoModal';

const Hero = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section id="home" className="relative pt-16 pb-20 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects - Kaleido style */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#00dd72]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#00ff22]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 md:w-64 md:h-64 bg-[#00dd72]/3 rounded-full blur-2xl"></div>
        
        {/* Faint Background Image - Hidden on mobile for better readability */}
        <div className="absolute inset-0 hidden md:flex items-start justify-end pr-8 pt-4">
          <img 
            src="/LandingPageAsset.svg" 
            alt="DeFi platform background" 
            className="w-auto h-3/4 max-w-lg opacity-40 object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            Your{' '}
            <motion.span
              className="bg-gradient-to-r from-[#00dd72] via-[#00ff22] to-[#00dd72] bg-clip-text text-transparent inline-block"
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              All-in-One
            </motion.span>{' '}
            Modular
            <br className="hidden sm:block" />
            DeFi Platform
          </h1>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Access lending, trading, staking, stablecoins, and fundraising — all in one place. 
            Powered by{' '}
            <span className="text-[#00dd72] font-semibold">AI intelligence</span>
            {' '}and built for{' '}
            <span className="text-[#00dd72] font-semibold">multi-chain</span> DeFi.
          </motion.p>
        </motion.div>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 md:mb-16 px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <GlowButton 
            size="lg" 
            className="group flex items-center justify-center w-full sm:w-auto"
            onClick={() => window.open('https://app.kaleidofinance.xyz', '_blank')}
          >
            Open Dapp
            <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </GlowButton>
          <GlowButton 
            variant="outline" 
            size="lg" 
            className="flex items-center justify-center w-full sm:w-auto"
            onClick={() => setDemoOpen(true)}
          >
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </GlowButton>
        </motion.div>

        {/* Demo Modal */}
        <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />

        {/* Stats/Benefits */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <motion.div 
            className="text-center p-4 md:p-6 rounded-xl border border-[#00dd72]/30 bg-white/5 backdrop-blur-md shadow-xl shadow-black/20 hover:border-[#00dd72]/50 hover:shadow-[#00dd72]/20 transition-all duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            {/* Subtle inner highlight for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-[#00dd72]/20 border border-[#00dd72]/30 backdrop-blur-sm">
                  <Grid3x3 className="w-6 h-6 md:w-7 md:h-7 text-[#00dd72]" />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#00dd72] mb-2">6 Products</div>
              <div className="text-sm md:text-base text-gray-300">Complete DeFi Suite</div>
            </div>
          </motion.div>
          <motion.div 
            className="text-center p-4 md:p-6 rounded-xl border border-[#00dd72]/30 bg-white/5 backdrop-blur-md shadow-xl shadow-black/20 hover:border-[#00dd72]/50 hover:shadow-[#00dd72]/20 transition-all duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            {/* Subtle inner highlight for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-[#00dd72]/20 border border-[#00dd72]/30 backdrop-blur-sm">
                  <Brain className="w-6 h-6 md:w-7 md:h-7 text-[#00dd72]" />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#00dd72] mb-2">AI-Powered</div>
              <div className="text-sm md:text-base text-gray-300">Luca AI Assistant</div>
            </div>
          </motion.div>
          <motion.div 
            className="text-center p-4 md:p-6 rounded-xl border border-[#00dd72]/30 bg-white/5 backdrop-blur-md shadow-xl shadow-black/20 hover:border-[#00dd72]/50 hover:shadow-[#00dd72]/20 transition-all duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -5 }}
          >
            {/* Subtle inner highlight for glass effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-xl"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-[#00dd72]/20 border border-[#00dd72]/30 backdrop-blur-sm">
                  <Network className="w-6 h-6 md:w-7 md:h-7 text-[#00dd72]" />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#00dd72] mb-2">Universal Access</div>
              <div className="text-sm md:text-base text-gray-300">Multiple Network</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
