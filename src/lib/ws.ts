"use server";

import { eventHandler } from "vinxi/http";
import { getRandomQuestion } from "~/lib/websocketHandlers/questions";

import {
  connections,
  presenters,
  viewers,
  usedQuestions,
} from "~/lib/websocketHandlers/connection";
import { getCurrentQuestion } from "~/lib/cache";

function clearQuestionCache() {
  usedQuestions.clear();
  console.log("Question cache cleared");
}

async function broadcastCurrentQuestion(code: string) {
  const question = await getCurrentQuestion(code);
  if (!question) return;

  // Send to all connections
  connections.forEach((peer: any) => {
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
            const { role, game_code } = data.payload;
            if (role === "presenter") {
              presenters.add(peer.id);
              console.log("Registered presenter:", peer.id);
            } else if (role === "viewer") {
              viewers.add(peer.id);
              console.log("Registered viewer:", peer.id);
            }

            // After registration, send the initial data
            const cards = await getCurrentQuestion(game_code);
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
            await getCurrentQuestion(data.payload.game_code);
            await broadcastCurrentQuestion(data.payload.game_code);
            break;
          }

          case "REVEAL_CARD": {
            if (!viewers.has(peer.id)) return;

            // Broadcast to all presenters
            presenters.forEach((presenterId: any) => {
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
