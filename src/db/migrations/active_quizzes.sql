CREATE TABLE IF NOT EXISTS active_quizzes (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    quiz_date DATE NOT NULL,
    quiz_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, quiz_date)
);
