"use server";

let currentQuestion: any = null;

const usedQuestions = new Set<string>(); // Store used question IDs
const MAX_RETRY_ATTEMPTS = 5; // Prevent infinite loops

export { currentQuestion, usedQuestions, MAX_RETRY_ATTEMPTS };
