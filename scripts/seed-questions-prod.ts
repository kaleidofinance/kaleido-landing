import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { Question } from '../src/models/quiz';
import { allQuestions } from '../src/data/quiz-questions';

interface FormattedQuestion {
  _id?: string;
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

async function seedQuestions() {
  try {
    console.log('Connecting to production database...');
    await mongoose.connect(process.env.MONGODB_URI!);

    // Create backup of existing questions
    console.log('Creating backup of existing questions...');
    const existingQuestions = await Question.find({});
    const backupDir = resolve(__dirname, '../data');
    const backupPath = resolve(backupDir, 'questions-backup.json');
    
    try {
      await mkdir(backupDir, { recursive: true });
      await writeFile(backupPath, JSON.stringify(existingQuestions, null, 2));
    } catch (error) {
      console.warn('Warning: Could not create backup file, continuing anyway');
      console.warn(error);
    }

    // Clear existing questions
    console.log('Clearing existing questions...');
    await Question.deleteMany({});

    // Format questions for MongoDB
    console.log('Formatting questions for MongoDB...');
    console.log('Imported questions:', allQuestions.length);
    
    // Debug log each question
    allQuestions.forEach((q, i) => {
      console.log(`\nQuestion ${i + 1}:`);
      console.log('Question:', q.question);
      console.log('Type:', q.type);
      console.log('Answers:', q.answers);
      console.log('CorrectAnswer:', q.correctAnswer);
      console.log('Category:', q.category);
      console.log('Difficulty:', q.difficulty);
    });

    const formattedQuestions: FormattedQuestion[] = allQuestions.map(q => {
      // More detailed validation
      if (q === undefined || q === null) {
        throw new Error('Found undefined or null question');
      }

      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Invalid question text: ${JSON.stringify(q)}`);
      }

      if (typeof q.correctAnswer !== 'number') {
        throw new Error(`Question has invalid correctAnswer type (${typeof q.correctAnswer}): ${q.question}`);
      }

      if (q.correctAnswer === undefined) {
        throw new Error(`Question missing correctAnswer: ${q.question}`);
      }

      if (!Array.isArray(q.answers) || q.answers.length < 2 || q.answers.length > 4) {
        throw new Error(`Question has invalid answers array: ${q.question}`);
      }

      if (q.correctAnswer < 0 || q.correctAnswer >= q.answers.length) {
        throw new Error(`Question has invalid correctAnswer index: ${q.question}`);
      }

      return {
        question: q.question,
        answers: q.answers,
        correctAnswer: q.correctAnswer,
        category: q.category,
        difficulty: q.difficulty,
        type: 'single',
        active: true,
        usageCount: 0,
        successRate: 0
      };
    });

    console.log(`\nTotal formatted questions: ${formattedQuestions.length}`);

    // Log question stats
    const stats = {
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      byAnswerCount: {} as Record<number, number>
    };

    formattedQuestions.forEach(q => {
      stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      stats.byAnswerCount[q.answers.length] = (stats.byAnswerCount[q.answers.length] || 0) + 1;
    });

    console.log('\nQuestion Statistics:');
    console.log('By Category:', stats.byCategory);
    console.log('By Difficulty:', stats.byDifficulty);
    console.log('By Answer Count:', stats.byAnswerCount);

    // Log sample questions for verification
    console.log('\nSample questions:');
    for (const category of Object.keys(stats.byCategory)) {
      const sample = formattedQuestions.find(q => q.category === category);
      if (sample) {
        console.log(`\n${category}:`);
        console.log(JSON.stringify(sample, null, 2));
      }
    }

    // Insert questions
    console.log('\nInserting questions...');
    await Question.insertMany(formattedQuestions);
    console.log('Successfully seeded questions!');

  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

seedQuestions();
