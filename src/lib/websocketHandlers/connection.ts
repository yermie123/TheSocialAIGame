"use server";

const connections = new Map<string, any>();
const presenters = new Set<string>();
const viewers = new Set<string>();

let currentQuestion: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5;

const usedQuestions = new Set<string>(); // Store used question IDs
const MAX_RETRY_ATTEMPTS = 5; // Prevent infinite loops

export {
  connections,
  presenters,
  viewers,
  currentQuestion,
  lastFetchTime,
  CACHE_DURATION,
  usedQuestions,
  MAX_RETRY_ATTEMPTS,
};
