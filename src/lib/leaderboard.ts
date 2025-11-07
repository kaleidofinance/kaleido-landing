import { pool } from './mysql';
import { RowDataPacket } from 'mysql2';
import { getUserPoints } from './mysql';

// Cache implementation
interface LeaderboardCache {
  timestamp: number;
  data: {
    allUsersWithPoints: Array<{walletAddress: string, total_points: number}>;
    topUsers: LeaderboardEntry[];
  };
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache
let leaderboardCache: LeaderboardCache | null = null;

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  total_points: number;
  username?: string;
}

export interface LeaderboardResponse {
  topUsers: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
}

/**
 * Get leaderboard data including top users and current user position
 * @param walletAddress - The current user's wallet address
 * @param limit - Number of top users to return
 */
/**
 * Get leaderboard data including top users and current user position
 * Uses caching to improve performance
 * @param walletAddress - The current user's wallet address
 * @param limit - Number of top users to return
 */
export async function getLeaderboard(walletAddress: string, limit: number = 20): Promise<LeaderboardResponse> {
  console.log('Getting leaderboard data for wallet:', walletAddress);
  
  // Check if we have valid cached data
  const now = Date.now();
  if (leaderboardCache && (now - leaderboardCache.timestamp < CACHE_DURATION)) {
    console.log('Using cached leaderboard data, cache age:', Math.round((now - leaderboardCache.timestamp) / 1000), 'seconds');
    
    // Use cached data for top users
    const topUsers = leaderboardCache.data.topUsers;
    
    // Find current user's position in the cached data
    const allUsersWithPoints = leaderboardCache.data.allUsersWithPoints;
    const currentUserIndex = allUsersWithPoints.findIndex(u => 
      u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    let currentUser = null;
    if (currentUserIndex !== -1) {
      const userPoints = allUsersWithPoints[currentUserIndex];
      currentUser = {
        rank: currentUserIndex + 1,
        walletAddress: userPoints.walletAddress,
        username: `${userPoints.walletAddress.substring(0, 6)}...${userPoints.walletAddress.substring(userPoints.walletAddress.length - 4)}`,
        total_points: userPoints.total_points
      };
    }
    
    console.log('Current user data (from cache):', currentUser);
    
    return {
      topUsers,
      currentUser
    };
  }
  
  // If no cache or cache expired, fetch fresh data
  console.log('Cache miss or expired, fetching fresh leaderboard data');
  const connection = await pool.getConnection();
  try {
    // Get all users with points from user_points table
    const [allUsers] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT user_id FROM user_points
    `);
    
    console.log(`Found ${allUsers.length} users with points`);
    
    // Create an array to store all user points
    const usersWithPoints: Array<{walletAddress: string, total_points: number}> = [];
    
    // For each user, get their points
    for (const userRow of allUsers) {
      const userId = userRow.user_id;
      try {
        const userPoints = await getUserPoints(userId);
        usersWithPoints.push({
          walletAddress: userId,
          total_points: userPoints.total_points
        });
      } catch (error) {
        console.error(`Error getting points for user ${userId}:`, error);
      }
    }
    
    // Sort users by points (descending)
    usersWithPoints.sort((a, b) => b.total_points - a.total_points);
    
    // Get top users and assign ranks
    const topUsers = usersWithPoints.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      walletAddress: user.walletAddress,
      username: `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`,
      total_points: user.total_points
    }));
    
    console.log(`Processed ${topUsers.length} top users`);
    
    // Update cache
    leaderboardCache = {
      timestamp: now,
      data: {
        allUsersWithPoints: usersWithPoints,
        topUsers
      }
    };
    
    // Find current user's rank
    const currentUserIndex = usersWithPoints.findIndex(u => 
      u.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
    
    let currentUser = null;
    if (currentUserIndex !== -1) {
      const userPoints = usersWithPoints[currentUserIndex];
      currentUser = {
        rank: currentUserIndex + 1,
        walletAddress: userPoints.walletAddress,
        username: `${userPoints.walletAddress.substring(0, 6)}...${userPoints.walletAddress.substring(userPoints.walletAddress.length - 4)}`,
        total_points: userPoints.total_points
      };
    }
    
    console.log('Current user data:', currentUser);
    
    return {
      topUsers,
      currentUser
    };
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    throw error;
  } finally {
    connection.release();
  }
}
