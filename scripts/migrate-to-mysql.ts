import { config } from 'dotenv';
import { resolve } from 'path';
import mysql from 'mysql2/promise';
import { allQuestions, QuizQuestion } from '../src/data/quiz-questions';

// Load environment variables - go up three levels from dist/scripts/scripts to root
const envPath = resolve(__dirname, '../../../.env.local');
console.log('Loading environment variables from:', envPath);
config({ path: envPath });

// Log DB connection details (without password)
console.log('Database connection details:', {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
});

// Validate question before insertion
function validateQuestion(q: QuizQuestion) {
    if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Invalid question text: ${JSON.stringify(q)}`);
    }
    if (!Array.isArray(q.answers) || q.answers.length !== 4) {
        throw new Error(`Question must have exactly 4 answers: ${q.question}`);
    }
    if (q.answers.some((a: string) => !a || typeof a !== 'string')) {
        throw new Error(`All answers must be non-empty strings: ${q.question}`);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correctAnswer (must be 0-3): ${q.question}`);
    }
    if (!q.category || typeof q.category !== 'string') {
        throw new Error(`Invalid category: ${q.question}`);
    }
    if (!q.difficulty || typeof q.difficulty !== 'string') {
        throw new Error(`Invalid difficulty: ${q.question}`);
    }
    return true;
}

const createTablesQuery = `
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Difficulty levels table
CREATE TABLE IF NOT EXISTS difficulty_levels (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer_1 TEXT NOT NULL,
    answer_2 TEXT NOT NULL,
    answer_3 TEXT NOT NULL,
    answer_4 TEXT NOT NULL,
    correct_answer TINYINT NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
    category_id VARCHAR(50) NOT NULL,
    difficulty_id VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(id),
    INDEX idx_category (category_id),
    INDEX idx_difficulty (difficulty_id),
    INDEX idx_active (active),
    UNIQUE INDEX idx_question (question(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const insertCategoriesQuery = `
INSERT IGNORE INTO categories (id, name) VALUES
('platform_features', 'Platform Features'),
('technical', 'Technical'),
('defi', 'DeFi'),
('security', 'Security'),
('tokenomics', 'Tokenomics');
`;

const insertDifficultiesQuery = `
INSERT IGNORE INTO difficulty_levels (id, name) VALUES
('easy', 'Easy'),
('medium', 'Medium'),
('hard', 'Hard');
`;

async function migrate() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || '127.0.0.1',
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        // First, clear existing questions
        console.log('Clearing existing questions...');
        await connection.query('DELETE FROM questions');
        console.log('Existing questions cleared');

        // Create tables
        console.log('Creating/updating tables...');
        await connection.query(createTablesQuery);
        console.log('Tables created/updated successfully');

        // Insert categories
        console.log('Inserting categories...');
        await connection.query(insertCategoriesQuery);
        console.log('Categories inserted successfully');

        // Insert difficulties
        console.log('Inserting difficulty levels...');
        await connection.query(insertDifficultiesQuery);
        console.log('Difficulty levels inserted successfully');

        // Insert questions
        console.log('Inserting questions...');
        const seenQuestions = new Set<string>();

        for (const q of allQuestions) {
            try {
                // Check for duplicates
                if (seenQuestions.has(q.question)) {
                    console.warn(`Skipping duplicate question: ${q.question}`);
                    continue;
                }
                seenQuestions.add(q.question);

                // Validate question
                validateQuestion(q);

                const query = `
                    INSERT INTO questions (
                        question, 
                        answer_1, 
                        answer_2, 
                        answer_3, 
                        answer_4, 
                        correct_answer, 
                        category_id, 
                        difficulty_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;

                await connection.execute(query, [
                    q.question,
                    q.answers[0],
                    q.answers[1],
                    q.answers[2],
                    q.answers[3],
                    q.correctAnswer,
                    q.category,
                    q.difficulty
                ]);

                console.log(`Inserted question: ${q.question.substring(0, 50)}...`);
            } catch (error: any) {
                console.error(`Failed to insert question: ${error.message}`);
                throw error;
            }
        }

        console.log('All questions inserted successfully');

        // Verify the data
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM questions');
        console.log(`Total questions in database: ${(rows as any)[0].count}`);

        // Show questions by category
        const [categoryStats] = await connection.query(
            'SELECT category_id, COUNT(*) as count FROM questions GROUP BY category_id'
        );
        console.log('\nQuestions by category:');
        console.log(categoryStats);

    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

migrate().catch(console.error);
