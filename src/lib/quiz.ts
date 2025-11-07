import { Question, QuizAttempt } from '@/models/quiz';
import { connectToDatabase } from '@/lib/mongodb';
import { startOfDay, endOfDay } from 'date-fns';

export async function getRandomQuestions(count: number, userId: string) {
  await connectToDatabase();
  const date = new Date();

  // Get questions randomly but ensure category distribution
  const questions = await Question.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: "$category",
        questions: { $push: "$$ROOT" }
      }
    },
    {
      $project: {
        // Get up to 2 random questions from each category
        questions: { $slice: [{ $shuffle: "$questions" }, 2] }
      }
    },
    { $unwind: "$questions" },
    {
      $replaceRoot: { newRoot: "$questions" }  
    },
    { $sample: { size: count } }  
  ]);

  return questions;  

}

export async function checkDailyAttempt(userId: string) {
  await connectToDatabase();
  const today = new Date();

  const attempt = await QuizAttempt.findOne({
    userId,
    date: {
      $gte: startOfDay(today),
      $lte: endOfDay(today)
    }
  });

  return attempt !== null;
}

export async function recordQuizAttempt(
  userId: string,
  questions: { questionId: string; userAnswer: number }[],
  score: number,
  timeSpent: number
) {
  await connectToDatabase();

  const attempt = new QuizAttempt({
    userId,
    date: new Date(),
    questions,
    score,
    timeSpent
  });

  await attempt.save();
  return attempt;
}

export async function getQuizStatistics(userId: string) {
  await connectToDatabase();

  const attempts = await QuizAttempt.find({ userId })
    .sort({ date: -1 })
    .limit(7);  

  return {
    totalAttempts: attempts.length,
    averageScore: attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length,
    totalQuestionsAnswered: attempts.reduce((acc, curr) => acc + curr.questions.length, 0),
    recentAttempts: attempts
  };
}
