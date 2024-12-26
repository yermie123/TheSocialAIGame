import { eventHandler } from "vinxi/http";
import { getRandomQuestion } from "./database";

const connections = new Map<string, any>();
const presenters = new Set<string>();
const viewers = new Set<string>();

let currentQuestion: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5;

const usedQuestions = new Set<string>(); // Store used question IDs
const MAX_RETRY_ATTEMPTS = 5; // Prevent infinite loops

async function getUniqueRandomQuestion(): Promise<any> {
  let attempts = 0;
  let question = null;

  console.log("Attempts: ", attempts);

  while (attempts < MAX_RETRY_ATTEMPTS) {
    question = await getRandomQuestion();

    // If we haven't used this question before, use it
    if (question && !usedQuestions.has(question.id)) {
      usedQuestions.add(question.id);
      return question;
    }

    attempts++;
  }

  // If we've used all questions or hit max retries, clear cache and try once more
  if (attempts >= MAX_RETRY_ATTEMPTS) {
    console.log("Clearing question cache and trying again");
    usedQuestions.clear();
    question = await getRandomQuestion();
    if (question) {
      usedQuestions.add(question.id);
    }
  }

  return question;
}

async function getCurrentQuestion(forceRefresh = false) {
  const now = Date.now();

  // If we have a cached question and it's not expired and we're not forcing refresh
  if (
    currentQuestion &&
    !forceRefresh &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return currentQuestion;
  }

  // Get new question
  try {
    currentQuestion = await getUniqueRandomQuestion();
    lastFetchTime = now;
    return currentQuestion;
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}

function clearQuestionCache() {
  usedQuestions.clear();
  console.log("Question cache cleared");
}

async function broadcastCurrentQuestion() {
  const question = await getCurrentQuestion();
  if (!question) return;

  // Send to all connections
  connections.forEach((peer) => {
    peer.send(
      JSON.stringify({
        type: "SYNC_QUESTION",
        payload: question,
      })
    );
  });
}

export default eventHandler({
  handler() {},
  websocket: {
    async open(peer) {
      connections.set(peer.id, peer);
      console.log("Connected:", peer.id);
    },

    async message(peer, msg) {
      try {
        const data = JSON.parse(msg.text());

        switch (data.type) {
          case "REGISTER_ROLE": {
            const { role } = data.payload;
            if (role === "presenter") {
              presenters.add(peer.id);
              console.log("Registered presenter:", peer.id);
            } else if (role === "viewer") {
              viewers.add(peer.id);
              console.log("Registered viewer:", peer.id);
            }

            // After registration, send the initial data
            const cards = await getCurrentQuestion();
            peer.send(
              JSON.stringify({
                type: "SYNC_QUESTION",
                payload: cards,
              })
            );
            break;
          }

          case "REQUEST_NEW_QUESTION": {
            // Only allow viewers to request new questions
            if (!viewers.has(peer.id)) return;

            // Force refresh the cache and broadcast to all
            await getCurrentQuestion(true);
            await broadcastCurrentQuestion();
            break;
          }

          case "REVEAL_CARD": {
            if (!viewers.has(peer.id)) return;

            // Broadcast to all presenters
            presenters.forEach((presenterId) => {
              const presenterPeer = connections.get(presenterId);
              if (presenterPeer) {
                presenterPeer.send(
                  JSON.stringify({
                    type: "REVEAL_CARD",
                    payload: { cardName: data.payload.cardName },
                  })
                );
              }
            });
            break;
          }

          case "CLEAR_QUESTION_CACHE": {
            if (!viewers.has(peer.id)) return;
            clearQuestionCache();
            break;
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },

    async close(peer) {
      connections.delete(peer.id);
      presenters.delete(peer.id);
      viewers.delete(peer.id);
      console.log("Disconnected:", peer.id);
    },
  },
});
