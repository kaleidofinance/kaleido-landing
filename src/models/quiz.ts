import mongoose, { Document } from 'mongoose';
import { QuizCategory, QuizDifficulty } from '@/types/quiz';

interface IQuestion extends Document {
  question: string;
  answers: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
  type: 'single';
  active: boolean;
  usageCount: number;
  successRate: number;
}

const questionSchema = new mongoose.Schema<IQuestion>({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
    validate: {
      validator: function(this: IQuestion, v: string[]) {
        return Array.isArray(v) && v.length >= 2 && v.length <= 4;
      },
      message: 'Questions must have between 2 and 4 answers'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['single'],
    default: 'single'
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function(this: IQuestion, v: number) {
        if (!this.answers) return false;
        return v >= 0 && v < this.answers.length;
      },
      message: 'Correct answer must be a valid index in the answers array'
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['platform_features', 'technical', 'defi', 'tokenomics', 'security']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  active: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add pre-save middleware to validate question type and answers
questionSchema.pre('save', function(next) {
  next();
});

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    userAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    }
  }],
  score: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number,  // in seconds
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for userId + date for faster lookups
quizAttemptSchema.index({ userId: 1, date: 1 }, { unique: true });

// Ensure models don't get registered multiple times
export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);
export const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', quizAttemptSchema);
