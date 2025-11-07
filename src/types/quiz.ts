export interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: number;  
  category: QuizCategory;
  difficulty: QuizDifficulty;
  type: 'single';
}

export type QuizQuestionWithoutAnswer = Omit<QuizQuestion, 'correctAnswer'>;

export type QuizCategory = 
  | 'platform_features'
  | 'technical'
  | 'defi'
  | 'security'
  | 'tokenomics';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizStats {
  totalAttempts: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
}

export interface DailyQuiz {
  id: string;
  userId: string;
  date: string;
  questions: QuizQuestion[];  
  completed: boolean;
  score?: number;
  answers?: number[];
  timeSpent?: number;
  pointsPerQuestion: number;
}

export interface DailyQuizClient {
  id: string;
  userId: string;
  date: string;
  questions: QuizQuestionWithoutAnswer[];  
  completed: boolean;
  score?: number;
  timeSpent?: number;
  pointsPerQuestion: number;
}

export interface QuizSubmission {
  quizId: string;
  userId: string;
  answers: number[];
  timeSpent: number;
}

export interface QuizResponse {
  success: boolean;
  error?: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completed: boolean;
  correctAnswers?: number;
  maxScore?: number;
  pointsPerQuestion?: number;
  stats?: QuizStats;
  quiz?: DailyQuizClient;
  nextQuizAvailable?: string;
}
