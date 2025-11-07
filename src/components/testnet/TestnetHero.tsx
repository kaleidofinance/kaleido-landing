'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ConnectWallet } from '@/components/common/ConnectWallet';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className="w-[100%] sm:w-[90%] h-[400px] bg-[#1A1B23] rounded-xl animate-pulse" />
  ),
});

const TestnetHero = () => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/mining-illustration.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch((err) => console.error('Error loading animation:', err));
  }, []);

  return (
    <section className="flex flex-col md:flex-row sm:py-16 py-6 px-4 sm:px-6">
      <div className="flex-1 flex flex-col justify-center xl:px-0 sm:pr-16 z-10">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <span className="bg-[#04c74f] px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm">Beta</span>
          <span className="text-[#04c74f] text-xs sm:text-sm">Testnet Phase 1</span>
        </div>
        
        <h1 className="font-KyivType font-bold text-white text-[32px] sm:text-[42px] md:text-[55px] lg:text-[65px] leading-[40px] sm:leading-[50px] md:leading-[60px] lg:leading-[72px]">
          Join Kaleido
          <br className="hidden sm:block" />
          <span className="text-gradient">Testnet Mining</span>
        </h1>

        <p className="font-normal text-[#898CA9] text-sm sm:text-[15px] md:text-base leading-[20px] sm:leading-[24px] max-w-[510px] mt-4 sm:mt-7 md:mt-10">
          Be among the first to experience Kaleido's revolutionary P2P lending platform. 
          Register for our testnet, participate in mining activities, and earn rewards.
        </p>

        <div className="mt-8">
          <ConnectWallet />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 sm:mt-8 md:mt-12">
         
          <div className="bg-[#1A1B23] rounded-xl p-4 sm:p-6">
            <h3 className="text-[#04c74f] text-xl sm:text-2xl font-bold">TBA</h3>
            <p className="text-[#898CA9] text-sm sm:text-base mt-2">Total Mining Rewards</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center md:my-0 my-8 relative z-10">
        {animationData && (
          <Lottie 
            animationData={animationData}
            className="w-[100%] sm:w-[90%] h-auto relative z-[5]"
            loop={true}
            autoplay={true}
          />
        )}
      </div>
    </section>
  );
};

export default TestnetHero;
