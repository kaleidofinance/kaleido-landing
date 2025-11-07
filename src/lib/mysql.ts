import mysql from 'mysql2/promise';
import { QuizQuestion, QuizCategory, QuizDifficulty, DailyQuiz } from '@/types/quiz';
import { RowDataPacket } from 'mysql2';

// Validation functions
const isQuizCategory = (value: string): value is QuizCategory => {
    return ['platform_features', 'technical', 'defi', 'security', 'tokenomics'].includes(value);
};

const isQuizDifficulty = (value: string): value is QuizDifficulty => {
    return ['easy', 'medium', 'hard'].includes(value);
};

interface QuestionRow extends RowDataPacket {
    id: number;
    question: string;
    answer_1: string;
    answer_2: string;
    answer_3: string;
    answer_4: string;
    correct_answer: number;
    category_id: string;
    difficulty_id: string;
}

interface CategoryRow extends RowDataPacket {
    id: string;
}

interface DifficultyRow extends RowDataPacket {
    id: string;
}

// Create a connection pool
export const pool = mysql.createPool({
    host: process.env.NODE_ENV === 'production' ? 'kaleidofinance.xyz' : '127.0.0.1',
    user: process.env.MYSQL_USER || 'questions',
    password: process.env.MYSQL_PASSWORD || 'questions',
    database: process.env.MYSQL_DATABASE || 'questions',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : undefined
});

// Test the connection
pool.getConnection()
    .then(conn => {
        console.log('MySQL connected successfully to database:', process.env.MYSQL_DATABASE);
        conn.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });

export async function getRandomQuestions(count: number, category?: QuizCategory, difficulty?: QuizDifficulty): Promise<QuizQuestion[]> {
    try {
        console.log('Getting random questions:', { count, category, difficulty });

        let query = `
            SELECT 
                id, question, answer_1, answer_2, answer_3, answer_4,
                correct_answer, category_id, difficulty_id
            FROM questions
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (category) {
            conditions.push('category_id = ?');
            params.push(category);
        }

        if (difficulty) {
            conditions.push('difficulty_id = ?');
            params.push(difficulty);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY RAND()';
        
        console.log('Query:', query);
        console.log('Params:', params);

        const [rows] = await pool.query<QuestionRow[]>(query, params);
        console.log(`Got ${rows?.length || 0} rows`);
        
        if (!Array.isArray(rows)) {
            console.error('Unexpected response format:', rows);
            throw new Error('Failed to fetch questions');
        }

        return rows.slice(0, count).map(row => {
            // Validate category and difficulty
            if (!isQuizCategory(row.category_id)) {
                throw new Error(`Invalid category: ${row.category_id}`);
            }
            if (!isQuizDifficulty(row.difficulty_id)) {
                throw new Error(`Invalid difficulty: ${row.difficulty_id}`);
            }

            return {
                id: row.id.toString(),
                question: row.question,
                answers: [row.answer_1, row.answer_2, row.answer_3, row.answer_4],
                correctAnswer: row.correct_answer,
                category: row.category_id,
                difficulty: row.difficulty_id,
                type: 'single'
            };
        });
    } catch (error) {
        console.error('Error getting random questions:', error);
        throw error;
    }
}

export async function updateQuestionStats(questionId: string, correct: boolean) {
    try {
        const query = `
            UPDATE questions
            SET 
                usage_count = COALESCE(usage_count, 0) + 1,
                success_rate = (COALESCE(success_rate, 0) * COALESCE(usage_count, 0) + ?) / (COALESCE(usage_count, 0) + 1)
            WHERE id = ?
        `;
        
        console.log('Query:', query);
        console.log('Params:', [correct ? 1 : 0, questionId]);

        await pool.query(query, [correct ? 1 : 0, questionId]);
    } catch (error) {
        console.error('Error updating question stats:', error);
        throw error;
    }
}

export async function getCategories(): Promise<QuizCategory[]> {
    try {
        console.log('Getting categories');
        const query = 'SELECT DISTINCT category_id as id FROM questions ORDER BY category_id';
        console.log('Query:', query);

        const [rows] = await pool.query<CategoryRow[]>(query);
        console.log('Got categories:', rows);

        if (!Array.isArray(rows)) {
            console.error('Unexpected response format:', rows);
            throw new Error('Failed to fetch categories');
        }

        const categories = rows.map(row => row.id).filter(isQuizCategory);
        if (categories.length === 0) {
            throw new Error('No valid categories found');
        }

        return categories;
    } catch (error) {
        console.error('Error getting categories:', error);
        throw error;
    }
}

export async function getDifficulties(): Promise<QuizDifficulty[]> {
    try {
        console.log('Getting difficulties');
        const query = 'SELECT DISTINCT difficulty_id as id FROM questions ORDER BY difficulty_id';
        console.log('Query:', query);

        const [rows] = await pool.query<DifficultyRow[]>(query);
        console.log('Got difficulties:', rows);

        if (!Array.isArray(rows)) {
            console.error('Unexpected response format:', rows);
            throw new Error('Failed to fetch difficulties');
        }

        const difficulties = rows.map(row => row.id).filter(isQuizDifficulty);
        if (difficulties.length === 0) {
            throw new Error('No valid difficulties found');
        }

        return difficulties;
    } catch (error) {
        console.error('Error getting difficulties:', error);
        throw error;
    }
}

export async function canAttemptQuiz(userId: string): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute<RowDataPacket[]>(
            `SELECT quiz_date 
             FROM quiz_attempts 
             WHERE user_id = ? 
             AND quiz_date >= DATE_SUB(CURDATE(), INTERVAL 24 HOUR)
             ORDER BY quiz_date DESC 
             LIMIT 1`,
            [userId]
        );
        
        if (Array.isArray(rows) && rows.length > 0) {
            const lastAttempt = rows[0];
            const lastAttemptDate = new Date(lastAttempt.quiz_date);
            const now = new Date();
            const hoursSinceLastAttempt = (now.getTime() - lastAttemptDate.getTime()) / (1000 * 60 * 60);
            console.log('Hours since last attempt:', hoursSinceLastAttempt);
            return hoursSinceLastAttempt >= 24;
        }
        return true;
    } finally {
        conn.release();
    }
}

export type PointSource = 'quiz' | 'task' | 'nft_mint';

export interface UserPoints {
    quiz_points: number;
    task_points: number;
    nft_points: number;
    total_points: number;
}

export async function addUserPoints(
    userId: string,
    points: number,
    sourceType: PointSource,
    sourceId: string
): Promise<void> {
    const conn = await pool.getConnection();
    try {
        await conn.execute(
            `INSERT INTO user_points (user_id, points, source_type, source_id)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE points = VALUES(points)`,
            [userId, points, sourceType, sourceId]
        );
    } finally {
        conn.release();
    }
}

export async function getUserPoints(userId: string): Promise<UserPoints> {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute<RowDataPacket[]>(
            `SELECT * FROM user_total_points WHERE user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return {
                quiz_points: 0,
                task_points: 0,
                nft_points: 0,
                total_points: 0
            };
        }

        return {
            quiz_points: rows[0].quiz_points || 0,
            task_points: rows[0].task_points || 0,
            nft_points: rows[0].nft_points || 0,
            total_points: rows[0].total_points || 0
        };
    } finally {
        conn.release();
    }
}

export async function saveQuizAttempt(
    userId: string,
    quizId: string,
    score: number,
    maxScore: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number
): Promise<void> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Save quiz attempt
        await conn.execute(
            `INSERT INTO quiz_attempts (
                id, user_id, quiz_date, score, max_score,
                correct_answers, total_questions, time_spent
            ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
            [quizId, userId, score, maxScore, correctAnswers, totalQuestions, timeSpent]
        );

        // Save points
        await addUserPoints(userId, score, 'quiz', quizId);

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

export async function getLastQuizAttempt(userId: string): Promise<{
    quizDate: string;
    score: number;
    maxScore: number;
    correctAnswers: number;
} | null> {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(
            `SELECT quiz_date, score, max_score, correct_answers 
             FROM quiz_attempts 
             WHERE user_id = ? 
             ORDER BY quiz_date DESC 
             LIMIT 1`,
            [userId]
        );
        
        if (Array.isArray(rows) && rows.length > 0) {
            const attempt = rows[0] as any;
            return {
                quizDate: attempt.quiz_date.toISOString().split('T')[0],
                score: attempt.score,
                maxScore: attempt.max_score,
                correctAnswers: attempt.correct_answers
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting last quiz attempt:', error);
        throw error;
    } finally {
        conn.release();
    }
}

export async function getUserQuizStats(userId: string): Promise<{
    totalAttempts: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
}> {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(
            `SELECT 
                COUNT(*) as total_attempts,
                SUM(score) as total_score,
                AVG(score) as average_score,
                MAX(score) as best_score
             FROM quiz_attempts 
             WHERE user_id = ?`,
            [userId]
        );
        
        if (Array.isArray(rows) && rows.length > 0) {
            const stats = rows[0] as any;
            return {
                totalAttempts: stats.total_attempts || 0,
                totalScore: stats.total_score || 0,
                averageScore: Math.round(stats.average_score) || 0,
                bestScore: stats.best_score || 0
            };
        }
        return {
            totalAttempts: 0,
            totalScore: 0,
            averageScore: 0,
            bestScore: 0
        };
    } catch (error) {
        console.error('Error getting user quiz stats:', error);
        throw error;
    } finally {
        conn.release();
    }
}

export async function saveActiveQuiz(quiz: DailyQuiz): Promise<void> {
    const conn = await pool.getConnection();
    try {
        // Convert quiz to a plain object for JSON serialization
        const quizData = {
            ...quiz,
            questions: quiz.questions.map(q => ({
                ...q,
                answers: Array.isArray(q.answers) ? q.answers : []
            }))
        };

        console.log('Quiz data to save:', quizData);

        // First check if quiz exists
        const [existing] = await conn.execute<RowDataPacket[]>(
            `SELECT * FROM active_quizzes WHERE user_id = ? AND quiz_date = CURDATE()`,
            [quiz.userId]
        );
        console.log('Existing quizzes:', existing);

        // First delete any existing quiz for this user today
        await conn.execute(
            `DELETE FROM active_quizzes WHERE user_id = ? AND quiz_date = CURDATE()`,
            [quiz.userId]
        );

        // Then insert the new quiz
        const jsonData = JSON.stringify(quizData);
        console.log('JSON data to save:', jsonData);

        await conn.execute(
            `INSERT INTO active_quizzes (id, user_id, quiz_date, quiz_data)
             VALUES (?, ?, CURDATE(), ?)`,
            [quiz.id, quiz.userId, jsonData]
        );

        console.log('Successfully saved quiz:', {
            id: quiz.id,
            userId: quiz.userId,
            date: quiz.date,
            questionCount: quiz.questions.length
        });

    } catch (error) {
        console.error('Error saving active quiz:', error);
        throw error;
    } finally {
        conn.release();
    }
}

export async function getActiveQuiz(quizId: string): Promise<DailyQuiz | null> {
    const conn = await pool.getConnection();
    try {
        console.log('Getting quiz from MySQL:', quizId);

        // First check all quizzes for this user
        const userId = quizId.split('-')[0];
        const [allQuizzes] = await conn.execute<RowDataPacket[]>(
            `SELECT * FROM active_quizzes WHERE user_id = ?`,
            [userId]
        );
        console.log('All quizzes for user:', allQuizzes);

        // Try to find the quiz with exact ID match
        const [rows] = await conn.execute<RowDataPacket[]>(
            `SELECT * FROM active_quizzes WHERE id = ? AND quiz_date = CURDATE()`,
            [quizId]
        );

        console.log('MySQL query result:', {
            found: Array.isArray(rows) && rows.length > 0,
            rowCount: rows?.length,
            firstRow: rows?.[0]
        });

        if (!Array.isArray(rows) || rows.length === 0) {
            // If not found by ID, try to find by user ID and today's date
            const [fallbackRows] = await conn.execute<RowDataPacket[]>(
                `SELECT * FROM active_quizzes 
                 WHERE user_id = ? AND quiz_date = CURDATE()
                 ORDER BY created_at DESC LIMIT 1`,
                [userId]
            );

            console.log('Fallback query result:', {
                found: Array.isArray(fallbackRows) && fallbackRows.length > 0,
                rowCount: fallbackRows?.length,
                firstRow: fallbackRows?.[0]
            });

            if (!Array.isArray(fallbackRows) || fallbackRows.length === 0) {
                return null;
            }

            return parseQuizData(fallbackRows[0]);

        }

        return parseQuizData(rows[0]);

    } catch (error) {
        console.error('Error getting active quiz:', error);
        throw error;
    } finally {
        conn.release();
    }
}

function parseQuizData(row: RowDataPacket): DailyQuiz | null {
    try {
        if (!row?.quiz_data) {
            console.error('No quiz_data found in row:', row);
            return null;
        }

        // Handle case where quiz_data might be a buffer or already parsed
        let rawData = row.quiz_data;
        if (Buffer.isBuffer(rawData)) {
            rawData = rawData.toString('utf8');
        }
        if (typeof rawData === 'object') {
            rawData = JSON.stringify(rawData);
        }

        console.log('Raw quiz data to parse:', rawData);

        let quiz: DailyQuiz;
        try {
            quiz = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        } catch (e) {
            console.error('Failed to parse quiz_data:', e);
            console.log('Invalid quiz_data:', rawData);
            return null;
        }

        console.log('Parsed quiz:', {
            id: quiz.id,
            userId: quiz.userId,
            date: quiz.date,
            questionCount: quiz.questions?.length,
            completed: quiz.completed,
            rawQuestions: quiz.questions
        });

        // Validate required fields
        if (!quiz.id || !quiz.userId || !Array.isArray(quiz.questions)) {
            console.error('Missing required fields:', {
                hasId: !!quiz.id,
                hasUserId: !!quiz.userId,
                hasQuestions: Array.isArray(quiz.questions)
            });
            return null;
        }

        // Ensure quiz has all required properties with proper types
        return {
            id: String(quiz.id),
            userId: String(quiz.userId),
            date: quiz.date || new Date().toISOString().split('T')[0],
            questions: quiz.questions.map(q => ({
                id: String(q.id),
                question: String(q.question),
                answers: Array.isArray(q.answers) ? q.answers.map(String) : [],
                correctAnswer: Number(q.correctAnswer) || 0,
                category: q.category || 'platform_features',
                difficulty: q.difficulty || 'medium',
                type: 'single'
            })),
            completed: Boolean(quiz.completed),
            score: quiz.score ? Number(quiz.score) : undefined,
            answers: Array.isArray(quiz.answers) ? quiz.answers.map(Number) : undefined,
            timeSpent: quiz.timeSpent ? Number(quiz.timeSpent) : undefined,
            pointsPerQuestion: Number(quiz.pointsPerQuestion) || 50
        };
    } catch (error) {
        console.error('Error parsing quiz data:', error);
        return null;
    }
}

export async function getPastWeekPerformance(userId: string): Promise<{
    date: string;
    score: number;
    maxScore: number;
    correctAnswers: number;
}[]> {
    const conn = await pool.getConnection();
    try {
        // Get attempts only from current week (Sunday to Saturday)
        const [rows] = await conn.execute<RowDataPacket[]>(
            `SELECT 
                quiz_date as date,
                score,
                max_score as maxScore,
                correct_answers as correctAnswers
             FROM quiz_attempts 
             WHERE user_id = ? 
             AND YEARWEEK(quiz_date) = YEARWEEK(NOW())
             ORDER BY quiz_date DESC`,
            [userId]
        );

        return rows.map(row => ({
            date: row.date.toISOString().split('T')[0],
            score: row.score,
            maxScore: row.maxScore,
            correctAnswers: row.correctAnswers
        }));
    } finally {
        conn.release();
    }
}

// Task types
export interface Task {
    id: string;
    title: string;
    description: string;
    points: number;
    link: string;
    claimed?: boolean;
}

/**
 * Get all available tasks for a user
 */
export async function getTasks(userId: string): Promise<Task[]> {
    const connection = await pool.getConnection();
    try {
        const [tasks] = await connection.query<RowDataPacket[]>(
            `SELECT 
                t.*,
                CASE WHEN ut.user_id IS NOT NULL THEN 1 ELSE 0 END as claimed
            FROM tasks t
            LEFT JOIN user_tasks ut ON t.id = ut.task_id AND ut.user_id = ?
            ORDER BY t.created_at DESC
        `, [userId]);

        return tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            points: task.points,
            link: task.link,
            claimed: task.claimed === 1
        }));
    } finally {
        connection.release();
    }
}

/**
 * Claim a task for a user
 */
export async function claimTask(userId: string, taskId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
        // Start transaction
        await connection.beginTransaction();

        // Check if task exists and hasn't been claimed
        const [tasks] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM tasks WHERE id = ?',
            [taskId]
        );

        if (tasks.length === 0) {
            throw new Error('Task not found');
        }

        const task = tasks[0];

        // Check if already claimed
        const [claimed] = await connection.query<RowDataPacket[]>(
            'SELECT 1 FROM user_tasks WHERE user_id = ? AND task_id = ?',
            [userId, taskId]
        );

        if (claimed.length > 0) {
            throw new Error('Task already claimed');
        }

        // Record the claim
        await connection.query(
            'INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)',
            [userId, taskId]
        );

        // Add points using addUserPoints
        await addUserPoints(
            userId,
            task.points,
            'task',
            taskId
        );

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
