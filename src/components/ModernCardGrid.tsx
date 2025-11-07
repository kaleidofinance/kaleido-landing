import React from "react";
import ModernCard from "./ModernCard";
import { Wallet, TrendingUp, Shield, Globe } from "lucide-react";

const cards = [
  {
    icon: Wallet,
    title: "Lending",
    bullets: [
      "Earn passive returns on your crypto assets",
      "Choose interest rates & lending durations",
      "Stay in complete control of your assets",
    ],
    bg: "bg-[#131317]",
  },
  {
    icon: TrendingUp,
    title: "Borrowing",
    bullets: [
      "Access liquidity without selling your assets",
      "Competitive rates & flexible repayment terms",
      "Customize loan duration to fit your needs",
    ],
    bg: "bg-[#22242F]",
  },
  {
    icon: Shield,
    title: "Collateral Management",
    bullets: [
      "Deposit, monitor, and manage your collateral",
      "Real-time health tracking & adjustments",
      "Optimize collateral for secure borrowing",
    ],
    bg: "bg-[#22242F]",
  },
  {
    icon: Globe,
    title: "Marketplace Access",
    bullets: [
      "Explore lending & borrowing opportunities",
      "Browse, filter, and match with peers",
      "Find the best rates and terms for your needs",
    ],
    bg: "bg-[#131317]",
  },
];

const ModernCardGrid = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <ModernCard key={i} {...card} />
        ))}
      </div>
    </div>
  </section>
);

export default ModernCardGrid;
