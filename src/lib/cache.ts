"use server";

import NodeCache from "@cacheable/node-cache";

const cache = new NodeCache();

interface CacheEntry {
  currentQuestion?: string;
  usedQuestions?: any[];
  MAX_RETRY_ATTEMPTS: number;
  peers: {
    presenter: string;
    viewer?: string;
  };
}

const getCurrentQuestion = (code: string): string => {
  // Use code string to access cache
  let cacheData = cache.get<CacheEntry>(code);
  return cacheData.currentQuestion;
};

const getUsedQuestions = (code: string): Set<string> => {
  // retrieve used questions from cache
  const usedQuestions = cache.get<CacheEntry>(code).usedQuestions;
  return usedQuestions;
};

export type { CacheEntry };
export { getCurrentQuestion, getUsedQuestions };
export default cache;
