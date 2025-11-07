"use client";

import Navbar from "@/components/Navbar";
import Roadmap from "@/components/Roadmap";
import Footer from "@/components/Footer";

export default function RoadmapPage() {
  return (
    <div className="w-full overflow-hidden bg-black relative">
      <div className="border-b border-[#808080]">
        <div className="md:max-w-[94%] m-auto">
          <div className="px-6 flex justify-center items-center">
            <div className="xl:max-w-[1440px] w-full">
              <Navbar />
            </div>
          </div>
        </div>
      </div>

      <Roadmap />
      
      <Footer />
    </div>
  );
} 