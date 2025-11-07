"use client";
import React, { Suspense, useEffect } from 'react';
import TestnetHero from '@/components/testnet/TestnetHero';
import TestnetRegistration from '@/components/testnet/TestnetRegistration';
import dynamic from 'next/dynamic';
import Navbar from "@/components/Navbar";
import toast from 'react-hot-toast';
import Footer from "@/components/Footer";

const MiningDashboard = dynamic(
  () => import('@/components/mining/MiningDashboard'),
  { ssr: false }
);

function RegistrationLoading() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}

export default function TestnetPage() {
  useEffect(() => {
    // Check for the x_link_success cookie
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )x_link_success=([^;]*)/);
      if (match && match[1] === '1') {
        toast.success('X (Twitter) account linked successfully!');
        // Clear the cookie
        document.cookie = 'x_link_success=; path=/testnet; max-age=0';
      }
      // Check for the x_link_error cookie
      const errorMatch = document.cookie.match(/(?:^|; )x_link_error=([^;]*)/);
      if (errorMatch && errorMatch[1] === '1') {
        toast.error('This X (Twitter) account is already linked to another wallet.');
        // Clear the cookie
        document.cookie = 'x_link_error=; path=/testnet; max-age=0';
      }
    }
  }, []);

  return (
    <div className="w-full overflow-hidden bg-black relative">
      <div className="border-b border-[#808080]">
        <div className="md:max-w-[94%] m-auto">
          <div className="flex justify-center items-center">
            <div className="xl:max-w-[1440px] w-full">
              <Navbar />
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute w-full top-[4%] h-[700px] z-10 black__gradient" />
        <div className="md:max-w-[94%] m-auto">
          <div className="flex justify-center items-center">
            <div className="xl:max-w-[1440px] w-full">
              <main className="min-h-screen bg-[#0F1014]">
                <TestnetHero />
                <Suspense fallback={<RegistrationLoading />}>
                  <TestnetRegistration />
                </Suspense>
                <MiningDashboard />
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
