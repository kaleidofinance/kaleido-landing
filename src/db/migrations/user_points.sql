-- Create table for tracking user points from different sources
CREATE TABLE IF NOT EXISTS user_points (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(255) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    source_type ENUM('quiz', 'task', 'nft_mint') NOT NULL,
    source_id VARCHAR(255) NOT NULL, -- quiz_id, task_id, or nft_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_points (user_id, source_type),
    UNIQUE KEY unique_user_source (user_id, source_type, source_id)
);

-- Create a view for easy point totals
CREATE OR REPLACE VIEW user_total_points AS
SELECT 
    user_id,
    SUM(CASE WHEN source_type = 'quiz' THEN points ELSE 0 END) as quiz_points,
    SUM(CASE WHEN source_type = 'task' THEN points ELSE 0 END) as task_points,
    SUM(CASE WHEN source_type = 'nft_mint' THEN points ELSE 0 END) as nft_points,
    SUM(points) as total_points
FROM user_points
GROUP BY user_id;
