"use server";
import cache from "../cache";
import type { CacheEntry } from "../cache";
import { pool } from "../database";

const getRandomQuestion = async () => {
  console.log("Getting random question");
  try {
    const result = await pool.query(
      "SELECT * FROM game_questions ORDER BY RANDOM() LIMIT 1"
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return "error";
  }
};

async function getUniqueRandomQuestion(code: string): Promise<any> {
  // If certain properties dont exist on cache yet, populate them and return
  let attempts = 0;
  let question: any;
  let cacheData = cache.get<CacheEntry>(code);
  const newData = {
    ...cacheData,
  };

  // If usedQuestions doesn't exist, create it
  if (!cacheData.usedQuestions) {
    newData.usedQuestions = [];
  }

  console.log("Attempts: ", attempts);

  while (attempts < cacheData.MAX_RETRY_ATTEMPTS) {
    question = await getRandomQuestion();

    // If we haven't used this question before, use it
    if (question && !newData.usedQuestions.includes(question.id)) {
      newData.currentQuestion = await question.id;
      newData.usedQuestions.push(await question.id);
      return question;
    }

    attempts++;
  }

  // If we've used all questions or hit max retries, return
  if (attempts >= cacheData.MAX_RETRY_ATTEMPTS) {
    return "too many attempts";
  }

  // Update cache
  cache.set(code, newData);

  return question;
}

export { getUniqueRandomQuestion };
