CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    quiz_date DATE NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL,
    correct_answers INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, quiz_date)
);
