import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { allQuestions } from '../src/data/quiz-questions';

// Define the schema directly here for more control
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v.length === 4; // Exactly 4 answers required
      },
      message: 'Questions must have exactly 4 answers'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  category: {
    type: String,
    required: true,
    enum: ['platform_features', 'technical', 'defi', 'security', 'tokenomics']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  type: {
    type: String,
    required: true,
    enum: ['single']
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
});

// Create the model
const QuizQuestion = mongoose.model('QuizQuestion', questionSchema, 'quiz_questions_new');

async function seedQuestions() {
  try {
    console.log('Connecting to production database...');
    await mongoose.connect(process.env.MONGODB_URI!);

    // Create backup of existing questions
    console.log('Creating backup of existing questions...');
    const existingQuestions = await QuizQuestion.find({});
    const backupDir = resolve(__dirname, '../data');
    const backupPath = resolve(backupDir, 'questions-backup-new.json');
    
    try {
      await mkdir(backupDir, { recursive: true });
      await writeFile(backupPath, JSON.stringify(existingQuestions, null, 2));
      console.log('Backup created successfully');
    } catch (error) {
      console.warn('Warning: Could not create backup file, continuing anyway');
      console.warn(error);
    }

    // Clear existing questions
    console.log('Clearing existing questions...');
    await QuizQuestion.deleteMany({});

    // Insert questions in batches
    console.log('Inserting questions...');
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);
      batches.push(batch);
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\nProcessing batch ${i + 1}/${batches.length}`);
      
      for (const q of batch) {
        try {
          // Validate and insert each question individually
          const question = new QuizQuestion({
            question: q.question,
            answers: q.answers,
            correctAnswer: q.correctAnswer,
            category: q.category,
            difficulty: q.difficulty,
            type: 'single',
            active: true,
            usageCount: 0,
            successRate: 0
          });

          // Validate the document
          await question.validate();
          
          // If validation passes, save it
          await question.save();
          console.log(`Successfully inserted: "${q.question.substring(0, 50)}..."`);
        } catch (error) {
          console.error(`Error with question: "${q.question}"`);
          console.error('Error details:', error);
          // Continue with next question
        }
      }
    }

    const totalInserted = await QuizQuestion.countDocuments();
    console.log(`\nSuccessfully inserted ${totalInserted} questions`);

  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedQuestions();
