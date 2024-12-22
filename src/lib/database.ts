"use server";
import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

const pool = new Pool({
  host: process.env.VITE_PG_HOST,
  port: parseInt(process.env.VITE_PG_PORT ?? "5432", 10),
  user: process.env.VITE_PG_USER,
  password: process.env.VITE_PG_PASSWORD,
  database: process.env.VITE_PG_DATABASE,
  ssl: {
    rejectUnauthorized: false, // Enable SSL with self-signed certificates
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20, // maximum number of clients in the pool
});

interface VoterAnswers {
  voter: string;
  answers: {
    a: string;
    b: string;
    c: string;
  };
}

const createNewQuestion = async (
  model: string,
  question: string,
  answerType: "majority_vote" | "top_vote_weighted" | "top_vote",
  voterAnswers: VoterAnswers
) => {
  try {
    // Query adding only the question, and answerType, and creating empty answer_info and answers
    const result = await pool.query({
      text: `
          INSERT INTO game_questions (question, answer_type, answers, answer_info)
          VALUES ($1, $2, '[]'::jsonb, '{}'::jsonb)
          RETURNING id
        `,
      values: [question, answerType],
    });

    const questionId = result.rows[0].id;

    let answerInfo: any;
    if (answerType === "majority_vote") {
      // If majority vote, store voterAnswers.voter as key
      answerInfo = {
        [voterAnswers.voter]: [
          voterAnswers.answers.a,
          voterAnswers.answers.b,
          voterAnswers.answers.c,
        ],
      };
    } else {
      answerInfo = {
        [voterAnswers.voter]: {
          a: voterAnswers.answers.a,
          b: voterAnswers.answers.b,
          c: voterAnswers.answers.c,
        },
      };
    }

    const answers = voterAnswers.answers.map((answer: any) => ({
      answer,
      votes: 1,
    }));
    if (answerType === "top_vote_weighted") {
      answers[0].votes = 2;
    }

    await pool.query({
      text: `
          UPDATE game_questions
          SET answer_info = answer_info || $1,
              answers = answers || $2
          WHERE id = $3
        `,
      values: [answerInfo, answers, questionId],
    });
  } catch (error) {
    console.error(error);
  }
};

export { pool };
