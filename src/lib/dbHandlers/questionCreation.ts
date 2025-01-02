import { pool } from "../database";

interface VoterAnswers {
  voter: string;
  answers: {
    a: string;
    b: string;
    c: string;
  };
}

const createNewQuestion = async (
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

    const answers = [
      // Create an array of answers, with 1 vote for each
      {
        answer: voterAnswers.answers.a,
        votes: 1,
      },
      {
        answer: voterAnswers.answers.b,
        votes: 1,
      },
      {
        answer: voterAnswers.answers.c,
        votes: 1,
      },
    ];
    if (answerType === "top_vote_weighted") {
      // If top vote weighted, give 2 votes to first answer
      answers[0].votes = 2;
    }

    const JSONAnswers = JSON.stringify(answers);
    const JSONAnswerInfo = JSON.stringify(answerInfo);

    // This query below is only really acceptable because the jsonb values are empty
    const result2 = await pool.query({
      text: `
            UPDATE game_questions
            SET answer_info = answer_info || $1,
                answers = answers || $2
            WHERE id = $3
          `,
      values: [JSONAnswerInfo, JSONAnswers, questionId],
    });

    if (result2 && result2.rowCount) {
      return result2.rowCount > 0;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getAllQuestions = async () => {
  try {
    const result = await pool.query("SELECT * FROM game_questions");
    return result.rows;
  } catch (error) {
    console.error(error);
    return "error";
  }
};

interface EditAddQuestion {
  question: string;
  answerType: "majority_vote" | "top_vote_weighted" | "top_vote";
  questionId: number;
}

const addToExistingQuestion = async (
  question: EditAddQuestion,
  voterAnswers: VoterAnswers
) => {
  try {
    // Query to locate the question, then add new answers info and adjust the answers
    const result = await pool.query({
      text: `
            SELECT answers, answer_info, answer_type
            FROM game_questions
            WHERE id = $1
          `,
      values: [question.questionId],
    });

    if (result.rows.length === 0) {
      console.error("Question not found");
      return "error";
    }

    console.log("Result: ", result.rows[0]);

    const currentAnswers = result.rows[0].answers; // Current Answers from DB
    const currentAnswerInfo = result.rows[0].answer_info; // Current Answer Info from DB

    // Update answer info
    if (question.answerType === "majority_vote") {
      // If majority vote, store voterAnswers.voter as key
      currentAnswerInfo[voterAnswers.voter] = [
        voterAnswers.answers.a,
        voterAnswers.answers.b,
        voterAnswers.answers.c,
      ];
    } else {
      currentAnswerInfo[voterAnswers.voter] = {
        a: voterAnswers.answers.a,
        b: voterAnswers.answers.b,
        c: voterAnswers.answers.c,
      };
    }

    // Update answer 1
    let findRes1 = currentAnswers.find(
      (a: any) => a.answer === voterAnswers.answers.a
    );
    if (typeof findRes1 === "undefined") {
      currentAnswers.push({
        answer: voterAnswers.answers.a,
        votes: 1,
      });
    } else {
      // If answer already exists, add 1 extra vote
      findRes1.votes++;
      if (question.answerType === "top_vote_weighted") findRes1.votes++;
    }

    // Update answer 2
    let findRes2 = currentAnswers.find(
      (a: any) => a.answer === voterAnswers.answers.b
    );
    if (typeof findRes2 === "undefined") {
      currentAnswers.push({
        answer: voterAnswers.answers.b,
        votes: 1,
      });
    } else {
      // If answer already exists, add 1 extra vote
      findRes2.votes++;
    }

    // Update answer 3
    let findRes3 = currentAnswers.find(
      (a: any) => a.answer === voterAnswers.answers.c
    );
    if (typeof findRes3 === "undefined") {
      currentAnswers.push({
        answer: voterAnswers.answers.c,
        votes: 1,
      });
    } else {
      // If answer already exists, add 1 extra vote
      findRes3.votes++;
    }

    const JSONAnswers = JSON.stringify(currentAnswers);
    const JSONAnswerInfo = JSON.stringify(currentAnswerInfo);

    // Update the question with new answers and answer info
    const result2 = await pool.query({
      text: `
            UPDATE game_questions
            SET answer_info = $1,
                answers = $2
            WHERE id = $3
          `,
      values: [JSONAnswerInfo, JSONAnswers, question.questionId],
    });

    if (result2 && result2.rowCount) {
      return result2.rowCount > 0;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return "error";
  }
};

export { createNewQuestion, getAllQuestions, addToExistingQuestion };
