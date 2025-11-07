import { readFileSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { Question } from '../src/models/quiz';
import { allQuestions } from '../src/data/quiz-questions';

async function importQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/kaleido');

    // Clear existing questions
    await Question.deleteMany({});

    const result = await Question.insertMany(
      allQuestions.map(q => ({
        question: q.question,
        answers: q.answers,
        correctAnswer: q.correctAnswer,
        category: q.category,
        difficulty: q.difficulty,
        type: 'single',
        active: true,
        usageCount: 0,
        successRate: 0
      }))
    );

    console.log(`Successfully imported ${result.length} questions`);
  } catch (error) {
    console.error('Error importing questions:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importQuestions();
