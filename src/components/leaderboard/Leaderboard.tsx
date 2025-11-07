import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaUser, FaChevronDown } from 'react-icons/fa';
import { authService } from '@/services/authService';
import { toast } from 'react-hot-toast';

// Cache implementation
interface LeaderboardCache {
  timestamp: number;
  data: {
    topUsers: LeaderboardEntry[];
    currentUser: LeaderboardEntry | null;
  };
}

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// In-memory cache (shared across component instances)
let leaderboardCache: LeaderboardCache | null = null;

interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username?: string;
  total_points: number;
}

interface LeaderboardProps {
  currentUserWallet?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserWallet }) => {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleUsers, setVisibleUsers] = useState(5);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!authService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      // Check if we have valid cached data
      const now = Date.now();
      if (leaderboardCache && (now - leaderboardCache.timestamp < CACHE_DURATION)) {
        console.log('Using cached leaderboard data, cache age:', Math.round((now - leaderboardCache.timestamp) / 1000), 'seconds');
        
        // Use cached data
        setTopUsers(leaderboardCache.data.topUsers);
        setCurrentUser(leaderboardCache.data.currentUser);
        setHasMore(leaderboardCache.data.topUsers.length > visibleUsers);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Cache miss or expired, fetching fresh leaderboard data');
        setIsLoading(true);
        const response = await fetch('/api/leaderboard', {
          headers: authService.getAuthHeader()
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();
        
        // Update state
        setTopUsers(data.leaderboard.topUsers);
        setCurrentUser(data.leaderboard.currentUser);
        setHasMore(data.leaderboard.topUsers.length > visibleUsers);
        
        // Update cache
        leaderboardCache = {
          timestamp: now,
          data: {
            topUsers: data.leaderboard.topUsers,
            currentUser: data.leaderboard.currentUser
          }
        };
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUserWallet]);
  
  const handleSeeMore = () => {
    setVisibleUsers(prev => prev + 5);
    setHasMore(topUsers.length > visibleUsers + 5);
  };

  const formatWalletAddress = (address: string) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'; // Gold
    if (rank === 2) return 'text-gray-300'; // Silver
    if (rank === 3) return 'text-amber-600'; // Bronze
    return 'text-gray-400'; // Default
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy className="text-yellow-400" />;
    if (rank === 2) return <FaTrophy className="text-gray-300" />;
    if (rank === 3) return <FaTrophy className="text-amber-600" />;
    return <span className="text-gray-400">{rank}</span>;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl">
        <h2 className="text-2xl font-semibold mb-6">Top Performers</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#131317] p-4 rounded-xl animate-pulse flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-700 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topUsers.slice(0, 3).map((user) => (
              <motion.div
                key={user.rank}
                {...fadeInUp}
                transition={{ delay: user.rank * 0.1 }}
                className={`bg-gradient-to-r ${
                  user.rank === 1 
                    ? 'from-yellow-500/10 to-yellow-400/5' 
                    : user.rank === 2 
                    ? 'from-gray-400/10 to-gray-300/5' 
                    : 'from-amber-700/10 to-amber-600/5'
                } p-6 rounded-xl flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    user.rank === 1 
                      ? 'bg-yellow-500/20' 
                      : user.rank === 2 
                      ? 'bg-gray-400/20' 
                      : 'bg-amber-700/20'
                  }`}>
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {user.username || formatWalletAddress(user.walletAddress)}
                    </h3>
                    <p className="text-sm text-gray-400">{formatWalletAddress(user.walletAddress)}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#00dd72] to-[#00ff88] bg-clip-text text-transparent">
                  {user.total_points.toLocaleString()}
                </div>
              </motion.div>
            ))}

            {/* Rest of the leaderboard */}
            <div className="bg-[#131317] rounded-xl overflow-hidden mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topUsers.slice(3, visibleUsers).map((user) => (
                    <tr 
                      key={user.rank}
                      className={`${
                        currentUserWallet && user.walletAddress.toLowerCase() === currentUserWallet.toLowerCase()
                          ? 'bg-[#00dd72]/10'
                          : ''
                      } hover:bg-white/5 transition-colors`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`${getRankColor(user.rank)} font-medium`}>{user.rank}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="text-sm font-medium">
                              {user.username || formatWalletAddress(user.walletAddress)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatWalletAddress(user.walletAddress)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.total_points.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {hasMore && (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        <button 
                          onClick={handleSeeMore}
                          className="flex items-center justify-center w-full py-3 text-sm text-gray-400 hover:text-white bg-[#131317] hover:bg-[#1a1a21] rounded-b-xl transition-colors"
                        >
                          <span>See More</span>
                          <FaChevronDown className="ml-2" />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Current User Position */}
      {currentUser && currentUser.rank > 20 && (
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-6 rounded-2xl border border-white/5 shadow-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Your Position</h3>
          <div className="bg-[#131317] p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#00dd72]/20 flex items-center justify-center mr-3">
                <FaUser className="text-[#00dd72]" />
              </div>
              <div>
                <p className="font-medium">Rank #{currentUser.rank}</p>
                <p className="text-sm text-gray-400">{formatWalletAddress(currentUser.walletAddress)}</p>
              </div>
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-[#00dd72] to-[#00ff88] bg-clip-text text-transparent">
              {currentUser.total_points.toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Leaderboard;
