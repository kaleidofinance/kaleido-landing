import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/mysql";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface QuizAttemptRow extends RowDataPacket {
  quiz_date: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID is required" 
      }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<QuizAttemptRow[]>(
        `SELECT quiz_date FROM active_quizzes 
         WHERE user_id = ? AND quiz_date = CURDATE()`,
        [userId]
      );

      const canTakeQuiz = !Array.isArray(rows) || rows.length === 0;

      return NextResponse.json({
        success: true,
        canTakeQuiz,
        lastAttempt: rows[0]?.quiz_date,
        nextQuizAvailable: rows[0]?.quiz_date ? new Date(rows[0].quiz_date).getTime() + 24 * 60 * 60 * 1000 : null
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error checking quiz attempts:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to check quiz attempts" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID is required" 
      }, { status: 400 });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute<QuizAttemptRow[]>(
        `SELECT quiz_date FROM active_quizzes 
         WHERE user_id = ? AND quiz_date = CURDATE()`,
        [userId]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: "You have already taken today's quiz" 
        }, { status: 400 });
      }

      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO active_quizzes (user_id, quiz_date) 
         VALUES (?, CURDATE())`,
        [userId]
      );

      console.log('Inserted quiz attempt:', {
        affectedRows: result.affectedRows,
        insertId: result.insertId
      });

      return NextResponse.json({
        success: true,
        message: "Quiz attempt recorded"
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to record quiz attempt" 
    }, { status: 500 });
  }
}
