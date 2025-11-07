import { QuizCategory, QuizDifficulty } from '@/types/quiz';

export interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
  type: 'single';
}

export const allQuestions: QuizQuestion[] = [
  {
    question: "What is the maximum Loan-to-Value (LTV) ratio allowed in Kaleido?",
    answers: ["70%", "75%", "80%", "85%"],
    correctAnswer: 2,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "What happens when a loan's health factor drops below 1?",
    answers: ["The loan is paused", "A warning is issued", "The collateral is liquidated", "Interest rate increases"],
    correctAnswer: 2,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How does Kaleido's AI monitor health factors?",
    answers: ["Through manual checks", "Using continuous automated analysis", "Weekly audits", "User reports"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which features are part of Kaleido's core functionality?",
    answers: ["Lending and borrowing", "NFT minting", "Token swaps", "Staking rewards"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "What are Kaleido's long-term objectives?",
    answers: ["Maximize short-term profits", "Build sustainable DeFi ecosystem", "Replace traditional banking", "Focus on NFT trading"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which of these are common DeFi risks?",
    answers: ["Smart contract vulnerabilities", "Network congestion", "Oracle manipulation", "All of the above"],
    correctAnswer: 3,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What factors affect lending interest rates in DeFi?",
    answers: ["Supply and demand", "Market volatility", "Protocol governance", "All of the above"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which features help ensure platform security in Kaleido?",
    answers: ["Regular audits", "Multi-sig wallets", "Bug bounty program", "All of the above"],
    correctAnswer: 3,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What types of collateral are planned for future support?",
    answers: ["Stablecoins only", "Major cryptocurrencies", "NFTs and tokens", "All of the above"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which factors affect a user's borrowing capacity?",
    answers: ["Collateral value", "Market conditions", "Health factor", "All of the above"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which are common DeFi yield strategies?",
    answers: ["Lending", "Liquidity provision", "Yield farming", "All of the above"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which components ensure Kaleido's decentralization?",
    answers: ["DAO governance", "Open-source code", "Community voting", "All of the above"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What are potential risks in DeFi lending?",
    answers: ["Smart contract bugs", "Market volatility", "Oracle failures", "All of the above"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "How does early loan repayment work in Kaleido?",
    answers: ["Not allowed", "Allowed with penalty", "Allowed without penalty", "Requires approval"],
    correctAnswer: 2,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How are AI agents configured in Kaleido?",
    answers: ["Manual setup", "Automatic configuration", "Hybrid approach", "No configuration needed"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is required for flash loans?",
    answers: ["Collateral", "Same-block repayment", "KYC verification", "Multi-sig approval"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "How does liquidity provision affect returns?",
    answers: ["Always profitable", "Subject to IL", "Risk-free returns", "Fixed returns"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What determines the health factor?",
    answers: ["Collateral value", "Borrowed amount", "Market conditions", "All of the above"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What can Kaleido's AI agents predict?",
    answers: ["Market trends", "Risk levels", "User behavior", "All of the above"],
    correctAnswer: 3,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "How does collateral management work?",
    answers: ["Single asset only", "Multiple assets", "Stablecoins only", "NFTs only"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the primary benefit of Kaleido's flexible lending pools?",
    answers: ["Lower interest rates", "Multiple borrowers per pool", "No collateral required", "Instant approvals"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "Which feature ensures Kaleido's smart contract scalability?",
    answers: ["ERC20 standard", "EIP2535 Diamond standard", "ERC721 standard", "ERC1155 standard"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is a flash loan in DeFi?",
    answers: ["A quick approval loan", "A loan without collateral that must be repaid in the same transaction", "A high-interest loan", "A loan with instant disbursement"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is the purpose of yield farming?",
    answers: ["Mining new tokens", "Earning rewards by providing liquidity", "Reducing transaction fees", "Storing cryptocurrencies"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the main risk of over-collateralized lending?",
    answers: ["High interest rates", "Complex documentation", "Capital inefficiency", "Slow processing"],
    correctAnswer: 2,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How does Kaleido calculate the health factor?",
    answers: ["(Collateral Value * LTV) / Loan Amount", "Loan Amount / Collateral Value", "Collateral Value / Loan Amount", "(Loan Amount * LTV) / Collateral Value"],
    correctAnswer: 0,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What triggers a liquidation in Kaleido?",
    answers: ["Health factor > 1", "Health factor < 1", "LTV > 80%", "Collateral value increase"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What role do AI Agents play in Kaleido's risk management?",
    answers: ["Manual risk assessment", "Automated health monitoring", "User verification", "Token price prediction"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are lending pools managed in Kaleido?",
    answers: ["By platform administrators", "By lenders directly", "Through automated smart contracts", "By borrower consensus"],
    correctAnswer: 2,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What happens to the platform fees collected by Kaleido?",
    answers: ["Distributed to token holders", "Added to community treasury", "Used for buybacks", "Burned automatically"],
    correctAnswer: 1,
    category: "tokenomics",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the primary factor affecting lending interest rates in DeFi?",
    answers: ["Market demand", "Collateral type", "Protocol governance", "Token price"],
    correctAnswer: 0,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which feature is most important for platform security in Kaleido?",
    answers: ["Smart contract audits", "Multi-sig governance", "AI monitoring", "Regular updates"],
    correctAnswer: 0,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What type of collateral will be supported first in future updates?",
    answers: ["ERC20 tokens", "NFTs", "Real-world assets", "Stablecoins"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the most important factor affecting borrowing capacity?",
    answers: ["Collateral value", "Market conditions", "Historical performance", "Account age"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which is the most profitable DeFi yield strategy?",
    answers: ["Liquidity provision", "Yield farming", "Flash loan arbitrage", "Token staking"],
    correctAnswer: 2,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the most critical part of Kaleido's risk management?",
    answers: ["Health factor monitoring", "Price oracle validation", "Liquidation thresholds", "Collateral ratios"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "Which governance action requires the highest approval threshold?",
    answers: ["Smart contract upgrades", "Risk parameter changes", "New asset listings", "Fee adjustments"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Which component is most crucial for Kaleido's decentralization?",
    answers: ["Multi-sig contracts", "Distributed oracles", "Community governance", "Open-source code"],
    correctAnswer: 2,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is the biggest risk in DeFi lending?",
    answers: ["Smart contract vulnerabilities", "Oracle manipulation", "Market volatility", "Regulatory changes"],
    correctAnswer: 0,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Can users repay loans early without penalties in Kaleido?",
    answers: ["Yes", "No", "Depends on the pool", "Only with governance approval"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "Do AI agents require manual configuration for each pool?",
    answers: ["Yes", "No", "Only for new assets", "Depends on pool size"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Must flash loans be repaid in the same block?",
    answers: ["Yes", "No", "Depends on amount", "Protocol specific"],
    correctAnswer: 0,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "Does providing liquidity always result in impermanent loss?",
    answers: ["Yes", "No", "Only in volatile markets", "Only with stablecoins"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Is a health factor above 1 required to avoid liquidation?",
    answers: ["Yes", "No", "Depends on collateral", "Pool specific"],
    correctAnswer: 0,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "Can Kaleido's AI predict market movements with 100% accuracy?",
    answers: ["Yes", "No", "Only short-term", "Only major trends"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "Does Kaleido support multiple collateral types per loan?",
    answers: ["Yes", "No", "Future feature", "Pool dependent"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the minimum deposit required to start lending on Kaleido?",
    answers: ["0.1 ETH", "0.5 ETH", "1 ETH", "No minimum"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How often are interest rates updated in Kaleido?",
    answers: ["Every block", "Every hour", "Every day", "Every week"],
    correctAnswer: 0,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What happens to unclaimed rewards in Kaleido?",
    answers: ["They expire", "They accumulate", "They are redistributed", "They are burned"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How are governance proposals implemented in Kaleido?",
    answers: ["Immediate execution", "Time-locked execution", "Manual execution", "Conditional execution"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What determines the voting power in Kaleido's governance?",
    answers: ["Token holdings only", "Token holdings and time locked", "Activity level", "All of the above"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "Which consensus mechanism does Kaleido use?",
    answers: ["Proof of Work", "Proof of Stake", "Delegated Proof of Stake", "Hybrid PoS/PoW"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How does Kaleido handle network congestion?",
    answers: ["Static gas fees", "Dynamic fee adjustment", "Layer 2 scaling", "All of the above"],
    correctAnswer: 3,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What type of oracle system does Kaleido use?",
    answers: ["Centralized", "Decentralized", "Hybrid", "None"],
    correctAnswer: 2,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are smart contract upgrades handled?",
    answers: ["Immutable contracts", "Proxy pattern", "Factory pattern", "Manual migration"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is the primary scaling solution used by Kaleido?",
    answers: ["Sharding", "Layer 2 rollups", "Sidechains", "State channels"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "How often are security audits conducted?",
    answers: ["Monthly", "Quarterly", "Bi-annually", "Annually"],
    correctAnswer: 1,
    category: "security",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the maximum bug bounty reward?",
    answers: ["10 ETH", "50 ETH", "100 ETH", "Unlimited"],
    correctAnswer: 3,
    category: "security",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How are private keys secured in Kaleido?",
    answers: ["Local storage", "Hardware security modules", "Multi-party computation", "All of the above"],
    correctAnswer: 2,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What happens during a security breach?",
    answers: ["Immediate shutdown", "Gradual shutdown", "Circuit breaker activation", "Manual intervention"],
    correctAnswer: 2,
    category: "security",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are smart contract vulnerabilities prevented?",
    answers: ["Code review", "Automated testing", "Formal verification", "All of the above"],
    correctAnswer: 3,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is impermanent loss?",
    answers: ["Temporary price drop", "Loss from providing liquidity", "Network fee loss", "Exchange rate loss"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "How does automated market making work?",
    answers: ["Order book matching", "Constant product formula", "Price oracle feeds", "Manual price setting"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is the purpose of liquidity mining?",
    answers: ["Token distribution", "Price stability", "Network security", "All of the above"],
    correctAnswer: 0,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are liquidations handled in Kaleido?",
    answers: ["Manual process", "Automated with keepers", "User-initiated", "Admin-only"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What determines flash loan fees?",
    answers: ["Loan amount", "Network congestion", "Governance voting", "Fixed rate"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How are transaction fees distributed?",
    answers: ["All to validators", "Split between validators and treasury", "All to treasury", "Burned completely"],
    correctAnswer: 1,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What determines the reward distribution?",
    answers: ["Equal split", "Proportional to stake", "Activity-based", "Hybrid model"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How does Kaleido handle failed transactions?",
    answers: ["Automatic retry", "Manual retry only", "Refund and cancel", "Keep pending"],
    correctAnswer: 0,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What is the block time target?",
    answers: ["5 seconds", "10 seconds", "15 seconds", "20 seconds"],
    correctAnswer: 1,
    category: "technical",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How are smart contract upgrades secured?",
    answers: ["Multi-sig approval", "Time lock", "DAO voting", "All of the above"],
    correctAnswer: 3,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is the minimum time lock period?",
    answers: ["24 hours", "48 hours", "72 hours", "1 week"],
    correctAnswer: 2,
    category: "security",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are lending rates calculated?",
    answers: ["Fixed rate", "Variable based on utilization", "Governance set", "External oracle"],
    correctAnswer: 1,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What affects the collateralization ratio?",
    answers: ["Asset volatility", "Market liquidity", "Protocol risk", "All of the above"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "How does the referral system work?",
    answers: ["One-time bonus", "Revenue sharing", "Token rewards", "All of the above"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "What are the staking periods available?",
    answers: ["30 days only", "30/60/90 days", "Flexible only", "Flexible and fixed"],
    correctAnswer: 3,
    category: "platform_features",
    difficulty: "easy",
    type: "single"
  },
  {
    question: "How is cross-chain interoperability achieved?",
    answers: ["Bridges", "Atomic swaps", "Layer 0", "All of the above"],
    correctAnswer: 3,
    category: "technical",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What type of compression is used for on-chain data?",
    answers: ["None", "Calldata compression", "State compression", "Both B and C"],
    correctAnswer: 3,
    category: "technical",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are price feeds secured?",
    answers: ["Single oracle", "Multiple oracles", "Chainlink", "Hybrid system"],
    correctAnswer: 3,
    category: "security",
    difficulty: "hard",
    type: "single"
  },
  {
    question: "What is the emergency shutdown procedure?",
    answers: ["Immediate halt", "Gradual wind down", "DAO vote required", "Admin only"],
    correctAnswer: 1,
    category: "security",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "How are governance tokens distributed?",
    answers: ["ICO only", "Farming only", "Airdrop only", "Multiple methods"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "medium",
    type: "single"
  },
  {
    question: "What determines protocol fees?",
    answers: ["Fixed rate", "Governance", "Market conditions", "Hybrid model"],
    correctAnswer: 3,
    category: "defi",
    difficulty: "medium",
    type: "single"
  }
];
