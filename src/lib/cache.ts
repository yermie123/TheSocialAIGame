"use server";

import NodeCache from "@cacheable/node-cache";

const cache = new NodeCache();

interface CacheEntry {
  currentQuestion: string;
  lastFetchTime: number;
  usedQuestions: string[];
  MAX_RETRY_ATTEMPTS: number;
}

const getCurrentQuestion = (code: string): string => {
  // Use code string to access cache
  let cacheData = cache.get<CacheEntry>(code);
  return cacheData.currentQuestion;
};

const getUsedQuestions = (code: string): string[] => {
  // retrieve used questions from cache
  const usedQuestions = cache.get<CacheEntry>(code).usedQuestions;
  return usedQuestions;
};

export type { CacheEntry };
export { getCurrentQuestion, getUsedQuestions };
export default cache;
