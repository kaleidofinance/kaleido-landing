import { NextRequest, NextResponse } from "next/server";
import { QuizQuestion, DailyQuiz, DailyQuizClient, QuizCategory, QuizSubmission, QuizResponse } from "@/types/quiz";

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { 
    getRandomQuestions, 
    updateQuestionStats, 
    getCategories, 
    saveQuizAttempt, 
    getUserQuizStats,
    saveActiveQuiz,
    getActiveQuiz,
    canAttemptQuiz,
    getLastQuizAttempt,
    getPastWeekPerformance,
    getUserPoints
} from "@/lib/mysql";
import { verifyToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";

// Constants
const POINTS_PER_QUESTION = 50;

/**
 * Converts a DailyQuiz to DailyQuizClient by removing correct answers
 */
function toClientQuiz(quiz: DailyQuiz): DailyQuizClient {
    return {
        ...quiz,
        questions: quiz.questions.map(({ correctAnswer, ...q }) => q)
    };
}

/**
 * Verifies user authentication and registration
 */
async function verifyUser(request: NextRequest): Promise<string | null> {
    try {
        // Get JWT token from Authorization header
        const authHeader = request.headers.get('Authorization');
        console.log('Auth header:', authHeader);

        if (!authHeader?.startsWith('Bearer ')) {
            console.error('Missing or invalid authorization token');
            return null;
        }

        const token = authHeader.split(' ')[1];
        console.log('Token:', token);

        const decoded = await verifyToken(token);
        if (!decoded?.walletAddress) {
            console.error('Invalid token payload:', decoded);
            return null;
        }
        console.log('Decoded token:', decoded);
        
        // Connect to MongoDB and verify registration
        const { db } = await connectToDatabase();
        console.log('MongoDB connected successfully');

        const registration = await db.collection('kaleido').findOne({
            walletAddress: decoded.walletAddress.toLowerCase(),
            $or: [
                { status: 'approved' },
                { status: 'pending' }
            ]
        });

        console.log('Registration found:', registration);

        if (!registration?.walletAddress) {
            console.error('User not registered');
            return null;
        }

        return registration.walletAddress;
    } catch (error) {
        console.error('verifyUser error:', error);
        return null;
    }
}

/**
 * Generates a daily quiz for a specific user
 * @param userId - The user's unique identifier
 * @returns A daily quiz object containing questions and metadata
 */
async function generateDailyQuiz(userId: string): Promise<DailyQuiz> {
    const now = new Date();
    const cacheKey = `${userId}-${now.toISOString().split('T')[0]}`;
    
    // Get random questions
    const questions = await getRandomQuestions(10);
    
    const quiz: DailyQuiz = {
        id: cacheKey,
        userId,
        date: now.toISOString().split('T')[0],
        questions,
        completed: false,
        pointsPerQuestion: POINTS_PER_QUESTION
    };

    // Save the quiz to MySQL
    await saveActiveQuiz(quiz);

    return quiz;
}

function getTodayDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * GET handler for retrieving daily quiz
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Get wallet address from header
        const headerWallet = request.headers.get('X-Wallet-Address');
        if (!headerWallet) {
            return NextResponse.json({
                success: false,
                error: "Missing X-Wallet-Address header",
                quizId: "",
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points: 0
            }, { status: 400 });
        }

        // Verify user and get wallet from JWT
        const jwtWallet = await verifyUser(request);
        if (!jwtWallet) {
            return NextResponse.json({
                success: false,
                error: "Authentication failed, please reconnecting your wallet",
                quizId: "",
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points: 0
            }, { status: 401 });
        }

        // Verify that header wallet matches JWT wallet
        if (headerWallet.toLowerCase() !== jwtWallet.toLowerCase()) {
            return NextResponse.json({
                success: false,
                error: "Wallet address mismatch",
                quizId: "",
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points: 0
            }, { status: 403 });
        }

        // Get user points
        const points = await getUserPoints(jwtWallet);

        // Check if user can attempt quiz
        try {
            const canAttempt = await canAttemptQuiz(jwtWallet);
            if (!canAttempt) {
                const lastAttempt = await getLastQuizAttempt(jwtWallet);
                const pastWeekPerformance = await getPastWeekPerformance(jwtWallet);
                return NextResponse.json({
                    success: false,
                    error: "Please wait 24 hours between quiz attempts",
                    quizId: "",
                    score: lastAttempt?.score || 0,
                    totalQuestions: 0,
                    completed: false,
                    pointsPerQuestion: POINTS_PER_QUESTION,
                    lastAttempt,
                    pastWeekPerformance,
                    points
                }, { status: 200 });
            }
        } catch (error) {
            console.error('Error checking quiz attempt:', error);
            return NextResponse.json({
                success: false,
                error: "Failed to check quiz attempt status",
                quizId: "",
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points
            }, { status: 500 });
        }

        // Check if user already has a quiz for today
        const existingQuiz = await getActiveQuiz(`${jwtWallet}-${getTodayDate()}`);
        if (existingQuiz) {
            console.log('Found existing quiz:', {
                id: existingQuiz.id,
                completed: existingQuiz.completed
            });

            if (existingQuiz.completed) {
                const pastWeekPerformance = await getPastWeekPerformance(jwtWallet);
                return NextResponse.json({
                    success: false,
                    error: "Quiz already completed today",
                    quizId: existingQuiz.id,
                    score: existingQuiz.score || 0,
                    totalQuestions: existingQuiz.questions.length,
                    completed: true,
                    pointsPerQuestion: POINTS_PER_QUESTION,
                    pastWeekPerformance,
                    points
                });
            }

            const pastWeekPerformance = await getPastWeekPerformance(jwtWallet);
            return NextResponse.json({
                success: true,
                quizId: existingQuiz.id,
                score: 0,
                totalQuestions: existingQuiz.questions.length,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                quiz: toClientQuiz(existingQuiz),
                pastWeekPerformance,
                points
            });
        }

        // Generate a new quiz
        const quiz = await generateDailyQuiz(jwtWallet);
        console.log('Generated new quiz:', {
            id: quiz.id,
            questionCount: quiz.questions.length
        });

        // Save the quiz
        await saveActiveQuiz(quiz);

        const pastWeekPerformance = await getPastWeekPerformance(jwtWallet);
        return NextResponse.json({
            success: true,
            quizId: quiz.id,
            score: 0,
            totalQuestions: quiz.questions.length,
            completed: false,
            pointsPerQuestion: POINTS_PER_QUESTION,
            quiz: toClientQuiz(quiz),
            pastWeekPerformance,
            points
        });

    } catch (error) {
        console.error('Error getting quiz:', error);
        return NextResponse.json({
            success: false,
            error: "Failed to get quiz",
            quizId: "",
            score: 0,
            totalQuestions: 0,
            completed: false,
            pointsPerQuestion: POINTS_PER_QUESTION,
            pastWeekPerformance: null,
            points: 0
        }, { status: 500 });
    }
}

/**
 * POST handler for submitting quiz answers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const walletAddress = await verifyUser(request);
        if (!walletAddress) {
            return NextResponse.json({
                success: false,
                error: "Authentication failed",
                quizId: "",
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points: 0
            }, { status: 401 });
        }

        // Get user points
        const points = await getUserPoints(walletAddress);

        const submission = await request.json() as QuizSubmission;
        console.log('Received submission:', submission);

        if (!submission.quizId || !submission.answers || !Array.isArray(submission.answers)) {
            return NextResponse.json({
                success: false,
                error: "Invalid submission format",
                quizId: submission.quizId || "",
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points
            });
        }

        // Check if user can attempt quiz
        try {
            const canAttempt = await canAttemptQuiz(walletAddress);
            if (!canAttempt) {
                return NextResponse.json({
                    success: false,
                    error: "Please wait 24 hours between quiz attempts",
                    quizId: submission.quizId,
                    score: 0,
                    totalQuestions: 0,
                    completed: false,
                    pointsPerQuestion: POINTS_PER_QUESTION,
                    pastWeekPerformance: null,
                    points
                }, { status: 429 });
            }
        } catch (error) {
            console.error('Error checking quiz attempt:', error);
            return NextResponse.json({
                success: false,
                error: "Failed to check quiz attempt status",
                quizId: submission.quizId,
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points
            }, { status: 500 });
        }

        // Get the quiz from MySQL
        const quiz = await getActiveQuiz(submission.quizId);
        console.log('Retrieved quiz:', {
            found: !!quiz,
            id: quiz?.id,
            userId: quiz?.userId,
            date: quiz?.date,
            questionCount: quiz?.questions?.length
        });

        if (!quiz || !quiz.userId || quiz.userId.toLowerCase() !== walletAddress.toLowerCase()) {
            return NextResponse.json({
                success: false,
                error: "Quiz not found or expired",
                quizId: submission.quizId,
                score: 0,
                totalQuestions: 0,
                completed: false,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points
            });
        }

        if (quiz.completed) {
            return NextResponse.json({
                success: false,
                error: "Quiz already completed",
                quizId: submission.quizId,
                score: quiz.score || 0,
                totalQuestions: quiz.questions.length,
                completed: true,
                pointsPerQuestion: POINTS_PER_QUESTION,
                pastWeekPerformance: null,
                points
            });
        }

        // Calculate score and update stats
        let correctAnswers = 0;
        console.log('Calculating score for answers:', {
            submitted: submission.answers,
            correct: quiz.questions.map(q => q.correctAnswer)
        });

        for (let i = 0; i < submission.answers.length; i++) {
            const answer = submission.answers[i];
            if (typeof answer !== 'number') continue;
            
            const question = quiz.questions[i];
            if (!question) continue;

            const isCorrect = answer === question.correctAnswer;
            await updateQuestionStats(question.id, isCorrect);
            if (isCorrect) {
                correctAnswers++;
                console.log(`Question ${i + 1} correct! Answer: ${answer}`);
            }
        }

        // Calculate total score
        const score = correctAnswers * POINTS_PER_QUESTION;
        const maxScore = quiz.questions.length * POINTS_PER_QUESTION;
        console.log('Score calculation:', {
            correctAnswers,
            pointsPerQuestion: POINTS_PER_QUESTION,
            score,
            maxScore,
            percentage: Math.round((score / maxScore) * 100)
        });

        // Update the quiz with results
        quiz.completed = true;
        quiz.score = score;
        quiz.answers = submission.answers;
        quiz.timeSpent = submission.timeSpent;
        await saveActiveQuiz(quiz);

        // Save the quiz attempt
        await saveQuizAttempt(
            walletAddress,
            quiz.id,
            score,
            maxScore,
            correctAnswers,
            quiz.questions.length,
            submission.timeSpent || 0
        );

        // Get user stats
        const stats = await getUserQuizStats(walletAddress);
        const pastWeekPerformance = await getPastWeekPerformance(walletAddress);

        return NextResponse.json({
            success: true,
            quizId: quiz.id,
            score,
            totalQuestions: quiz.questions.length,
            completed: true,
            correctAnswers,
            maxScore,
            pointsPerQuestion: POINTS_PER_QUESTION,
            stats,
            pastWeekPerformance,
            points
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json({
            success: false,
            error: "Failed to submit quiz",
            quizId: "",
            score: 0,
            totalQuestions: 0,
            completed: false,
            pointsPerQuestion: POINTS_PER_QUESTION,
            pastWeekPerformance: null,
            points: 0
        }, { status: 500 });
    }
}
