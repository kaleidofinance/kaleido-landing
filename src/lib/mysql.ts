/**
 * mysql.ts — Server-side MySQL connection pool.
 * This module is ONLY safe to import in API routes (pages/api/** or app/api/**).
 * Never import it in client components or shared utilities.
 */

// Type exports used by other modules (safe to import anywhere for types only)
export interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  type: string;
  completed?: boolean;
  claimedAt?: string | null;
}

export interface UserPoints {
  quiz_points: number;
  task_points: number;
  nft_points: number;
  mining_points: number;
  total_points: number;
}

// Guard: only initialise the pool on the server
let pool: any = null;
let getUserPoints: (userId: string) => Promise<UserPoints> = async () => ({
  quiz_points: 0,
  task_points: 0,
  nft_points: 0,
  mining_points: 0,
  total_points: 0,
});

if (typeof window === 'undefined') {
  // Dynamically require mysql2 so it is never bundled by the browser
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mysql = require('mysql2/promise');

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kaleido',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    getUserPoints = async (userId: string): Promise<UserPoints> => {
      const connection = await pool.getConnection();
      try {
        const [rows]: any[] = await connection.query(
          `SELECT 
             COALESCE(SUM(CASE WHEN point_type = 'quiz'    THEN points ELSE 0 END), 0) AS quiz_points,
             COALESCE(SUM(CASE WHEN point_type = 'task'    THEN points ELSE 0 END), 0) AS task_points,
             COALESCE(SUM(CASE WHEN point_type = 'nft'     THEN points ELSE 0 END), 0) AS nft_points,
             COALESCE(SUM(CASE WHEN point_type = 'mining'  THEN points ELSE 0 END), 0) AS mining_points,
             COALESCE(SUM(points), 0) AS total_points
           FROM user_points
           WHERE user_id = ?`,
          [userId]
        );
        return rows[0] as UserPoints;
      } finally {
        connection.release();
      }
    };
  } catch (err) {
    console.warn('[mysql.ts] mysql2 not available or pool creation failed:', err);
  }
}

export { pool, getUserPoints };
