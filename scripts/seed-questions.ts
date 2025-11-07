import { connectToDatabase } from '@/lib/mongodb';
import { Question } from '@/models/quiz';
import { allQuestions } from '@/data/quiz-questions';

async function seedQuestions() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    console.log('Clearing existing questions...');
    await Question.deleteMany({});
    
    console.log('Formatting questions for MongoDB...');
    const formattedQuestions = allQuestions.map(q => ({
      question: q.question,
      answers: q.answers,
      correctAnswer: q.correctAnswer,
      category: q.category,
      difficulty: q.difficulty,
      type: 'single',
      active: true,
      usageCount: 0,
      successRate: 0
    }));
    
    console.log('Inserting questions...');
    await Question.insertMany(formattedQuestions);
    
    console.log(`Successfully seeded ${formattedQuestions.length} questions`);
    
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    process.exit();
  }
}

seedQuestions();
