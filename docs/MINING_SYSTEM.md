# Kalaido Mining System Documentation

## Overview
This document explains the mining and referral system implemented in the Kalaido platform. The system is designed to reward users for both mining activities and referring new users to the platform.

## Mining System

### Base Mining Rate (detail)
- Base earnings rate: 0.001 points per share (1 millipoint per share)
- Share generation occurs every second:
  - Minimum: 0 shares per second
  - Maximum: 3 shares per second
  - Average: 1.5 shares per second
- Daily mining calculation:
  - Seconds in a day: 86,400 (24 hours × 60 minutes × 60 seconds)
  - Average shares per day: 129,600 (86,400 × 1.5 shares)
  - Points per day: ~130 points (129,600 × 0.001)
- Mining continues as long as browser is open, even in background
- Points are accumulated in real-time and saved automatically

### Mining Rate Calculation Factors
1. **Worker Specialization** (detail)
   - Specialized workers:
     - +30% bonus to mining rate
     - Optimized for specific algorithms
     - Best performance when matched with their specialized pool
     - Example: A specialized worker mining at 100 points/day would earn 130 points/day
   - Hybrid workers:
     - +10% bonus to mining rate
     - Versatile across different algorithms
     - Consistent performance across all pools
     - Example: A hybrid worker mining at 100 points/day would earn 110 points/day
   - Standard workers:
     - No bonus (base rate)
     - Basic performance
     - Good for beginners
     - Example: Standard worker mines at exactly 100 points/day base rate

2. **Environmental Factors** (detail)
   - Random variation calculation:
     - Base variation: ±10% (0.9 to 1.1 multiplier)
     - Updates every mining cycle
     - Simulates real-world conditions
   - Affects multiple aspects:
     - Temperature: Influences worker performance
     - Network conditions: Impacts share submission rate
     - System load: Affects mining efficiency
   - Example scenarios:
     - Optimal conditions: +10% boost (110% efficiency)
     - Average conditions: 100% efficiency
     - Poor conditions: -10% penalty (90% efficiency)
   - Automatic adjustments:
     - System monitors conditions continuously
     - Adjusts rates in real-time
     - No user intervention required

3. **Pool Algorithm** (detail)
   - Algorithm types affect mining rates:
     - SHA-256: Base difficulty multiplier
     - Ethash: Variable difficulty based on network
     - Scrypt: Adaptive rate based on pool load
   - Dynamic multipliers:
     - Network difficulty adjustments
     - Pool hashrate variations
     - Real-time difficulty targeting
   - Pool selection strategy:
     - Match worker specialization when possible
     - Consider current network conditions
     - Monitor pool performance metrics
   - Performance monitoring:
     - Real-time hashrate tracking
     - Share acceptance rate
     - Network difficulty changes

### State Management (detail)
- Offline Mining Behavior:
  - Mining continues without internet but at reduced rate (50% of normal rate)
  - Points are stored locally and synced when connection resumes
  - IMPORTANT: Must have internet connection before stopping mining or closing browser
  - System will attempt to sync data for up to 5 minutes when connection returns

- Browser Operation Requirements:
  - Browser must remain running for continuous mining
  - Can run in background or minimized
  - Mining stops if browser closes
  - Always use "Stop Mining" button before:
    * Closing browser
    * Shutting down computer
    * Extended periods away

- Auto-save and Refresh System:
  - Auto-refreshes every 30 seconds:
    * Updates mining statistics
    * Syncs with server
    * Validates mining operation
  - Saves on events:
    * Every 30 seconds automatically
    * When "Stop Mining" is clicked
    * Browser close attempt
    * Tab visibility change
  - Restores state:
    * On page reload
    * Tab becomes visible
    * Browser restart (if properly stopped)

## Referral System

### Overview
The referral system uses a milestone-based approach by default, combining per-referral bonuses with milestone achievements.

### Bonus Types

#### 1. Base Referral Bonus
- 5% bonus per referral
- Applied to mining rate
- Accumulates with each referral

#### 2. Milestone Bonuses
Additional one-time bonuses at specific referral counts:
- 5 referrals: +10% bonus
- 10 referrals: +25% bonus
- 25 referrals: +50% bonus
- 50 referrals: +100% bonus

### Total Bonus Examples

1. **5 Referrals**
   - Base bonus: 5 × 5% = 25%
   - Milestone bonus: +10%
   - Total bonus: 35%
   - Daily mining: ~175.5 points

2. **10 Referrals**
   - Base bonus: 10 × 5% = 50%
   - Milestone bonus: +25%
   - Total bonus: 75%
   - Daily mining: ~227.5 points

3. **25 Referrals**
   - Base bonus: 25 × 5% = 125%
   - Milestone bonus: +50%
   - Total bonus: 175%
   - Daily mining: ~357 points

4. **50 Referrals**
   - Base bonus: 50 × 5% = 250%
   - Milestone bonus: +100%
   - Total bonus: 350%
   - Daily mining: ~585 points

## Technical Implementation

### Mining Process
1. User starts mining session
2. System generates 0-3 shares per second
3. Shares are converted to points using base rate
4. Bonuses are applied to final earnings

### Referral Process
1. User gets unique referral code
2. New users register with referral code
3. System tracks referral count
4. Bonuses automatically applied to mining rate

## Security Features
- Wallet address verification
- Referral code validation
- Server-side verification of mining activity
- Protection against duplicate referrals

## Performance Optimization
- Efficient share calculation
- Optimized state updates
- Minimal localStorage usage
- Periodic state persistence
