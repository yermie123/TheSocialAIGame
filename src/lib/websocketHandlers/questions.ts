"use server";
import cache from "~/lib/cache";
import type { CacheEntry } from "~/lib/cache";
import { pool } from "~/lib/database";

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
  let attempts = 0;
  let question: any;
  let cacheData = cache.get<CacheEntry>(code);

  console.log("Attempts: ", attempts);

  while (attempts < cacheData.MAX_RETRY_ATTEMPTS) {
    question = getRandomQuestion();

    // If we haven't used this question before, use it
    if (question && !cacheData.usedQuestions.has(question.id)) {
      cacheData.usedQuestions.add(question.id);
      return question;
    }

    attempts++;
  }

  // If we've used all questions or hit max retries, clear cache and try once more
  if (attempts >= cacheData.MAX_RETRY_ATTEMPTS) {
    return "too many attempts";
  }

  return question;
}

export { getUniqueRandomQuestion, getRandomQuestion };
